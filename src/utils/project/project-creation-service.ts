import { createClient } from '@/utils/supabase/client';
import { getSignedURL } from '@/app/dashboard/actions';
import { projectPromptSetup } from '@/utils/openai/actions';
import { v4 as uuidv4 } from 'uuid';
import { ProjectFormData } from '@/types/project-types';

export async function createProject(
  projectData: ProjectFormData, 
  updateStatus: (status: string) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const userData = data.user;
    updateStatus("Creating project database entry...");
    
    const uuid = uuidv4();
    const supabaseFilePath = `projects/${userData.id}/${uuid}`;

    const projectDataForDB = {
      id: uuid,
      title: projectData.title,
      description: projectData.description,
      owner: userData.id,
      metadata: {
        isFavourite: false,
        icon: projectData.icon,
        dataFilePath: supabaseFilePath,
        dataContext: projectData.dataContext,
        createdAt: new Date().toISOString(),
      }
    };

    const { error } = await supabase.from("projects").insert([projectDataForDB]);

    if (error) {
      console.error("Error creating project", error);
      return { success: false, error: "Error creating project. Please try again." };
    }

    updateStatus("Uploading data file...");
    const uploadURLResult = await getSignedURL(uuid);

    if (!uploadURLResult?.success) {
      return { success: false, error: "Error preparing upload. Please try again." };
    }

    const uploadURL = uploadURLResult.success.url;

    await fetch(uploadURL, {
      method: "PUT",
      body: projectData.csvFile
    });

    updateStatus("Upload successful! Finalizing your project...");
    updateStatus("Analyzing data and generating dashboard suggestions...");

    if (!projectData.csvFile) {
      return { success: false, error: "Missing file data" };
    }
    
    const csvContent = await projectData.csvFile.text();
    await projectPromptSetup(userData.id, uuid, csvContent, projectData.dataContext);

    return { success: true };
  } catch (error) {
    console.error("Error in createProject:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}