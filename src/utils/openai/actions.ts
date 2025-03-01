"use server";

import { createClient } from "@/utils/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import OpenAI from "openai";
import * as csv from 'csv-parse';

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

export async function projectPromptSetup(userID: string, projectUUID: string, csvContent: string, projectContext: string) {
}