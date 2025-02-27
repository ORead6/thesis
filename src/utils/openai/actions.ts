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

        // Create a summary of the data for OpenAI
        const dataSummary = {
            columns: columns,
            rowCount: records.length,
            sampleData: records.slice(0, 5), // Include a few sample rows
        };

        // Prepare the prompt for OpenAI
        const prompt = `
  You are given:
  1. A CSV dataset.
  2. The columns of the CSV: ${JSON.stringify(columns)}
  3. The number of rows in the CSV: ${records.length}+
  4. The raw CSV data: ${JSON.stringify(records, null, 2)}
  5. Additional context that may help interpret or calculate KPIs:
     ${projectContext}

  Your task:
  - Analyze the CSV dataset.
  - Derive 4 realistic and valuable Key Performance Indicators (KPIs) directly from the data.
  - Each KPI must accurately reflect actual calculations based on the provided data.
  - If the data does not contain enough information to compute a certain KPI precisely, state your assumption clearly but still provide the best estimate or pivot to a relevant KPI that can be computed.
  - Provide a brief explanation (5–10 words) about why each KPI is important.

  Output format requirements:
  - Return your answer as valid JSON only, following this exact structure:
    {
      "kpis": [
        {
          "header": "KPI Title",
          "value": "KPI Value (e.g. number, percentage, or short text without captions)",
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
  - Do not include any text outside the JSON.
  - Do not add extra fields; keep the JSON structure exact.
  - "value" must be derived from the data or estimated based on any assumptions. Provide numeric or short-text values only (no words like 'Value:' or 'Total:' before the number).
  - "explanation" should be concise, describing why the KPI is useful or actionable (5–10 words).
  - Avoid lengthy justifications or disclaimers. Stick to the specified output format.
`;


        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo-0125", // or another appropriate model
            temperature: 0.5,
            response_format: { type: "json_object" }
        });


        // Extract the JSON response from OpenAI
        const responseContent = completion.choices[0].message.content;

        if (!responseContent) {
            throw new Error("Empty response from OpenAI");
        }

        const kpiResults = JSON.parse(responseContent);

        // Store the KPI results in the S3 bucket
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
            throw new Error("Unauthorized");
        }

        // Upload the KPI results to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `projects/${userID}/${projectUUID}/kpi-data.json`,
        });

        // Get a signed URL for uploading the KPI data
        const uploadUrl = await getSignedUrl(s3, uploadCommand, { expiresIn: 60 });

        // Upload the KPI results
        await fetch(uploadUrl, {
            method: "PUT",
            body: JSON.stringify(kpiResults)
        });
        console.log("SHOULDVE UPLOADED")

        return { success: true };

    } catch (error) {
        console.error("Error generating KPIs:", error);
        return { success: false, error: (error as Error).message };
    }
}