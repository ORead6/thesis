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

export async function getKPISignedURL(projectUUID: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    console.log("Unauthorized")
    return
  }

  const userID = data.user.id

  const putObjctCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `projects/${userID}/${projectUUID}/kpiData.json`,
  });

  const signedURL = await getSignedUrl(s3, putObjctCommand, { expiresIn: 60 });

  return { success: { url: signedURL } };
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
  try {
    // First, list all objects with the project prefix
    const { ListObjectsV2Command, DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

    const projectPrefix = `projects/${userId}/${projectId}/`;

    // List all objects in the project directory
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: projectPrefix
    });

    const listedObjects = await s3.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log("No files found to delete");
      return { success: true };
    }

    // Prepare the delete command with all objects
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
      }
    };

    // Delete all listed objects
    await s3.send(new DeleteObjectsCommand(deleteParams));

    // Check if there might be more objects (S3 returns max 1000 keys per request)
    if (listedObjects.IsTruncated) {
      console.log("Warning: Not all project files may have been deleted due to pagination limits");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting project files:", error);
    return { success: false, error: (error as Error).message };
  }
}
