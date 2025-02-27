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

export async function KPIGenerator(userID: string, projectUUID: string, csvContent: string) {
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
      I have a CSV dataset with the following structure:
      
      Columns: ${JSON.stringify(columns)}
      Number of rows: ${records.length}+
      
      Here are some sample rows:
      ${JSON.stringify(dataSummary.sampleData, null, 2)}
      
      Based on this dataset, what are the 4 most valuable KPIs (Key Performance Indicators) that could be derived from this data?
      
      For each KPI, provide:
      1. A clear header/title
      2. The current value of the KPI based on the data
      3. A brief explanation of why this KPI is valuable
      
      Return your answer as valid JSON following this exact structure:
      {
        "kpis": [
          {
            "header": "KPI Title",
            "value": "KPI Value (can be a number, percentage, or meaningful text but do not give it a caption, literally just provide the value itself)",
            "explanation": "Brief explanation of the KPI's importance no more than 5-10 words"
          },
          ...3 more KPIs
        ]
      }
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