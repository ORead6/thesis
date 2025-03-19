import { createClient } from '@/utils/supabase/client';
import { getKPISignedURL, getSignedURL } from '@/app/dashboard/actions';
import { createAIAssistant, KPICreationSteps, projectPromptSetup } from '@/utils/openai/actions';
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

    if (!projectData.csvFile) {
      return { success: false, error: "Missing file data" };
    }

    // TODO I want to Upload the csv to openai so i can used code interpreter to not lose any context in prompts
    const assistantSetup = await createAIAssistant(userData.id, uuid, projectData, projectData.csvFile);

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
        selectedSport: projectData.sport,
        createdAt: new Date().toISOString(),
      },
      assistantData: assistantSetup
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

    updateStatus("Upload successful! Generating KPI's your project...");

    const kpiCreation = await KPICreationSteps(assistantSetup, uuid, userData.id, projectData.sport);

    updateStatus("KPI's generated! Uploading KPI data...");
    // Upload KPI Creation to JSON on S3
    const kpiUploadURL = await getKPISignedURL(uuid);
    if (!kpiUploadURL?.success) {
      return { success: false, error: "Error preparing KPI upload. Please try again." };
    }
    const kpiSuccessURL = kpiUploadURL.success.url
    await fetch(kpiSuccessURL, {
      method: "PUT",
      body: JSON.stringify(kpiCreation)
    });
    updateStatus("KPI data uploaded!");

    return { success: true };
  } catch (error) {
    console.error("Error in createProject:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}