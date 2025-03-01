"use server";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/utils/supabase/server";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedURL(projectUUID: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    console.log("Unauthorized")
    return
  }

  const userID = data.user.id

  const putObjctCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `projects/${userID}/${projectUUID}/csvData.csv`,
  });

  const signedURL = await getSignedUrl(s3, putObjctCommand, { expiresIn: 60 });

  return { success: { url: signedURL } };
}

export async function getKPIData(projectUUID: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    console.log("Unauthorized")
    return { error: "Unauthorized" }
  }

  const userID = data.user.id

  // Create a GetObject command to fetch the KPI data
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `projects/${userID}/${projectUUID}/kpi-data.json`,
  });

  try {
    // Get the object from S3
    const response = await s3.send(getObjectCommand);

    // Convert the readable stream to text
    const bodyContents = await response.Body?.transformToString();

    if (!bodyContents) {
      console.log("Empty KPI data returned");
      return { error: "No KPI data found" }
    }

    // Parse the JSON content
    try {
      const kpiData = JSON.parse(bodyContents);
      if (!kpiData) {
        return { error: "Invalid KPI data format" };
      }
      return { success: kpiData };
    } catch (parseError) {
      console.error("Error parsing KPI data JSON:", parseError);
      return { error: "Invalid KPI data format" };
    }
  } catch (err: any) {
    // Improve error logging with specific S3 error details
    console.error("Error fetching KPI data:", err);

    // Check if it's a NoSuchKey error (file doesn't exist)
    if (err.name === 'NoSuchKey') {
      return { error: "KPI data file doesn't exist for this project" };
    }

    // For other errors
    return { error: "Failed to fetch KPI data", details: err.message };
  }
}

export async function getCurrentProject(projectId: string) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return { error: "Unauthorized" };
  }

  // Get the project data
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner", userData.user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { project };
}

export async function deleteProjectFiles(userId: string, projectId: string) {
  // Could loop through a constant in a seperate file that has all the file names
  // That we need to delete or simply figure out how to delete that specific folder

  try {
    // Delete the main CSV file
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `projects/${userId}/${projectId}/csvData.csv`,
      })
    );

    // Delete the KPI data file
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `projects/${userId}/${projectId}/kpi-data.json`,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting project files:", error);
    return { success: false, error: (error as Error).message };
  }
}