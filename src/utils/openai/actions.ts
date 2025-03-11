"use server";

import { createClient } from "@/utils/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import OpenAI from "openai";
import * as csv from 'csv-parse';
import { ProjectFormData } from "@/types/project-types";
import { resourceLimits } from "worker_threads";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function KPIGenerator(userID: string, projectUUID: string, csvContent: string, projectContext: string) {
  const gptModel = "gpt-4o-mini-2024-07-18";

  try {
    // Parse CSV to analyze structure and sample data
    const parser = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    const records = [];
    const maxSampleRows = 100; // Limit the number of rows to avoid token limits

    for await (const record of parser) {
      records.push(record);
      if (records.length >= maxSampleRows) break;
    }

    if (records.length === 0) {
      throw new Error("CSV file contains no data");
    }

    // Extract column names
    const columns = Object.keys(records[0]);

    // STEP 1: Initial data analysis prompt with sample data included
    const analysisPrompt = `
  You are a data analyst tasked with understanding a CSV dataset.
  
  Dataset information:
  1. Columns: ${JSON.stringify(columns)}
  2. Number of rows: ${records.length}+
  3. Context provided by user: ${projectContext}
  4. Sample data: ${JSON.stringify(records.slice(0, 10), null, 2)}
  
  Analyze this dataset and provide:
  1. A summary of what this dataset represents
  2. Key metrics or relationships present in the data
  3. Potential insights that could be derived
  4. Any patterns, anomalies, or important observations
  5. Suggestions for meaningful KPIs that could be calculated

  Return your analysis as valid JSON with this structure:
  {
    "datasetDescription": "Brief description of what this dataset represents",
    "keyMetrics": ["metric1", "metric2", "metric3"],
    "relationships": ["relationship1", "relationship2"],
    "potentialInsights": ["insight1", "insight2", "insight3"],
    "kpiSuggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"]
  }
  `;

    // Call OpenAI API for initial analysis
    const analysisCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: gptModel,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysisResponse = analysisCompletion.choices[0].message.content;

    if (!analysisResponse) {
      throw new Error("Empty analysis response from OpenAI");
    }

    const analysisResults = JSON.parse(analysisResponse);
    console.log(analysisResults);

    // STEP 2: Generate KPIs based on the analysis and all data
    const kpiPrompt = `
  You are a KPI specialist tasked with converting suggested KPI ideas into fully actionable metrics from the dataset.

  I've already analyzed the dataset and here's what I know:
  ${JSON.stringify(analysisResults, null, 2)}

  Additional context from user:
  ${projectContext}

  Raw data information:
  - Columns: ${JSON.stringify(columns)}
  - Total rows: ${records.length}
  - Complete dataset: ${JSON.stringify(records, null, 2)}

  Your task:
  - Create exactly 4 Key Performance Indicators (KPIs) using only the suggestions found in "kpiSuggestions" from the analysis above
  - For each suggestion, derive a KPI that is directly calculable from the provided data
  - Make the KPIs insightful, actionable, and relevant to the dataset context
  - Use the actual values from the dataset for calculations
  - If assumptions are needed, make reasonable ones based on the provided information
  - Ensure the KPIs reflect the most important metrics for this type of data

  Output format requirements:
  - Return only a valid JSON with this exact structure:
  {
    "kpis": [
      {
        "header": "KPI Title",
        "value": "KPI Value (number, percentage, or short text)",
        "explanation": "Brief explanation (5-10 words max)"
      },
      {
        "header": "KPI Title",
        "value": "...",
        "explanation": "..."
      },
      {
        "header": "KPI Title",
        "value": "...",
        "explanation": "..."
      },
      {
        "header": "KPI Title",
        "value": "...",
        "explanation": "..."
      }
    ]
  }

  Important guidelines:
  - "value" must be a specific metric derived from the data (no prefixes like 'Value:')
  - "explanation" must be concise (5-10 words only)
  - Ensure calculations are accurate based on the provided data
  - Do not introduce new KPIs; only use the four "kpiSuggestions" provided
  - Use actual calculated values from the dataset, not placeholders
`;


    // Call OpenAI API for KPI generation
    const kpiCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: kpiPrompt }],
      model: gptModel,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const kpiResponse = kpiCompletion.choices[0].message.content;

    if (!kpiResponse) {
      throw new Error("Empty KPI response from OpenAI");
    }

    const kpiResults = JSON.parse(kpiResponse);

    // Create a combined result with both the analysis and KPIs

    // Store the combined results in the S3 bucket
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      throw new Error("Unauthorized");
    }

    // Upload the KPI results to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `projects/${userID}/${projectUUID}/kpi-data.json`,
      Body: JSON.stringify(kpiResults.kpis)
    });

    // Get a signed URL for uploading the KPI data
    const uploadUrl = await getSignedUrl(s3, uploadCommand, { expiresIn: 60 });

    // Upload the KPI results
    await fetch(uploadUrl, {
      method: "PUT",
      body: JSON.stringify(kpiResults.kpis)
    });
    console.log("Successfully uploaded KPI data with analysis");

    return { success: true };

  } catch (error) {
    console.error("Error generating KPIs:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAIAssistant(assistantData: { assistantData: any; }){
  let assistantId = assistantData.assistantData.assistant_id
  let fileID = assistantData.assistantData.file_id

  const assistantResponse = await openai.beta.assistants.del(assistantId);
  const fileResponse = await openai.files.del(fileID);
}

export async function projectPromptSetup(userID: string, projectUUID: string, csvContent: string, projectContext: string) {
  const gptModel = "gpt-4o-2024-08-06";
  const KPIAMOUNT = 10;
  try {
    // Parse CSV to analyze structure and sample data
    const parser = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    const records = [];
    const maxSampleRows = 100; // Limit the number of rows to avoid token limits

    for await (const record of parser) {
      records.push(record);
      if (records.length >= maxSampleRows) break;
    }

    if (records.length === 0) {
      throw new Error("CSV file contains no data");
    }

    // Extract column names
    const columns = Object.keys(records[0]);

    // STEP 1: Initial data analysis prompt with sample data included
    const analysisPrompt = `
  You are a data analyst tasked with understanding a CSV dataset.
  
  Dataset information:
  1. Columns: ${JSON.stringify(columns)}
  2. Number of rows: ${records.length}+
  3. Context provided by user: ${projectContext}
  4. Sample data: ${JSON.stringify(records.slice(0, 10), null, 2)}
  
  Analyze this dataset and provide:
  1. A summary of what this dataset represents
  2. What each row represents to your best understanding
  3. Key metrics or relationships present in the data
  4. Potential insights that could be derived
  5. Any patterns, anomalies, or important observations
  6. Suggestions for meaningful KPIs that could be calculated

  Return your analysis as valid JSON with this structure Ensure that there are ${KPIAMOUNT} KPI suggestions:
  {
    "datasetDescription": "Brief description of what this dataset represents",
    "rowDescriptions": "Brief description of what each row represents",
    "keyMetrics": ["metric1", "metric2", "metric3"],
    "relationships": ["relationship1", "relationship2"],
    "potentialInsights": ["insight1", "insight2", "insight3"],
    "kpiSuggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"]
  }
  `;

    // Call OpenAI API for initial analysis
    const analysisCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: gptModel,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysisResponse = analysisCompletion.choices[0].message.content;

    if (!analysisResponse) {
      throw new Error("Empty analysis response from OpenAI");
    }

    const analysisResults = JSON.parse(analysisResponse);
    console.log(analysisResults);

    // STEP 2: Generate KPI suggestions based on the analysis
    const kpiSuggestionPrompt = `
  You are a KPI expert tasked with suggesting Key Performance Indicators for a dataset.
  
  Here's the analysis of the dataset:
  ${JSON.stringify(analysisResults, null, 2)}
  
  Dataset information:
  1. Columns: ${JSON.stringify(columns)}
  2. Context provided by user: ${projectContext}
  
  Based on this analysis, suggest ${KPIAMOUNT} specific KPIs that would be valuable to track.
  Each KPI should be meaningful, relevant to the data, and calculable from the dataset.
  
  Return your suggestions as valid JSON with this structure:
  {
    "kpiSuggestions": [
      {
        "title": "Short KPI Title",
        "description": "Brief description of what this KPI measures and why it matters (max 15 words)"
      },
      {
        "title": "Short KPI Title",
        "description": "Brief description..."
      },
      {
        "title": "Short KPI Title",
        "description": "Brief description..."
      },
      {
        "title": "Short KPI Title",
        "description": "Brief description..."
      }
    ]
  }
  `;

    // Call OpenAI API for KPI suggestions
    const kpiSuggestionCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: kpiSuggestionPrompt }],
      model: gptModel,
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const kpiSuggestionResponse = kpiSuggestionCompletion.choices[0].message.content;

    if (!kpiSuggestionResponse) {
      throw new Error("Empty KPI suggestion response from OpenAI");
    }

    const kpiSuggestions = JSON.parse(kpiSuggestionResponse);
    console.log("KPI Suggestions:", kpiSuggestions);

    // STEP 3: Calculate KPI values based on the whole dataset
    const kpiCalculationPrompt = `
  You are a data analyst tasked with calculating specific KPIs from a dataset.
  
  Here are the KPIs you need to calculate:
  ${JSON.stringify(kpiSuggestions.kpiSuggestions, null, 2)}
  
  Dataset information:
  1. Columns: ${JSON.stringify(columns)}
  2. Complete dataset: ${JSON.stringify(records, null, 2)}
  
  Calculate each of these ${KPIAMOUNT} KPIs using the provided dataset.
  For each KPI:
  1. Use the exact title provided
  2. Calculate a precise value based on the data
  3. Keep the same description
  
  Return your calculations as valid JSON with this structure:
  {
    "kpis": [
      {
        "title": "KPI Title",
        "value": "Calculated value (number, percentage, or short text)",
        "description": "Same brief description from suggestions"
      },
      {
        "title": "KPI Title",
        "value": "Calculated value",
        "description": "Brief description"
      },
      {
        "title": "KPI Title",
        "value": "Calculated value",
        "description": "Brief description"
      },
      {
        "title": "KPI Title",
        "value": "Calculated value",
        "description": "Brief description"
      }
    ]
  }
  
  Ensure all values are accurately calculated from the dataset.
  `;

    // Call OpenAI API for KPI calculations
    const kpiCalculationCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: kpiCalculationPrompt }],
      model: gptModel,
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const kpiCalculationResponse = kpiCalculationCompletion.choices[0].message.content;

    if (!kpiCalculationResponse) {
      throw new Error("Empty KPI calculation response from OpenAI");
    }

    const kpiResults = JSON.parse(kpiCalculationResponse);
    console.log("Final KPIs:", kpiResults);

    // STEP 4: Upload the KPI results to S3
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      throw new Error("Unauthorized");
    }

    // Upload the KPI results to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `projects/${userID}/${projectUUID}/kpi-data.json`,
      Body: JSON.stringify(kpiResults.kpis)
    });

    // Get a signed URL for uploading the KPI data
    const uploadUrl = await getSignedUrl(s3, uploadCommand, { expiresIn: 60 });

    // Upload the KPI results
    await fetch(uploadUrl, {
      method: "PUT",
      body: JSON.stringify(kpiResults.kpis)
    });
    console.log("Successfully uploaded KPI data");

    return { success: true };
  }
  catch (err) {
    console.error("Error in projectPromptSetup:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function createAIAssistant(id: string, uuid: string, projectData: ProjectFormData, csvFile: File) {

  const assistantInstructions = `You are a professional ${projectData.sport} data analysist. When asked any sports data analysis questions, write and run code to answer the question whilst also reffering to the csv provided to obtain accurate results. This is the given context of the data: ${projectData.dataContext}`;

  const formData = new FormData();
  
  // Add the file from drag and drop
  formData.append('file', csvFile);

  const uploadFileOpenaiAPI = await openai.files.create({
    file: csvFile,
    purpose: "assistants"
  })

  const assistant = await openai.beta.assistants.create({
    instructions: assistantInstructions,
    model: "gpt-4o",
    tools: [{ "type": "code_interpreter" }],
    tool_resources: {
      "code_interpreter": {
        "file_ids": [uploadFileOpenaiAPI.id]
      }
    }
  });

  return ({
    file_id: uploadFileOpenaiAPI.id,
    assistant_id: assistant.id
  })
}