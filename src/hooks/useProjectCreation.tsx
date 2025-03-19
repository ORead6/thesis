import { useState, useRef, useEffect } from 'react';
import { ProjectFormData } from '@/types/project-types';
import { createProject } from '@/utils/project/project-creation-service';

export const initialState: ProjectFormData = {
  title: "",
  description: "",
  dataContext: "",
  icon: "activity",
  csvFile: null,
};

export function useProjectCreation(onSuccessCallback: () => void) {
  const [projectData, setProjectData] = useState<ProjectFormData>(initialState);
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState("");
  const [creationSuccess, setCreationSuccess] = useState(false);
  const createOperationRef = useRef<{ inProgress: boolean }>({ inProgress: false });

  const updateData = (field: string, value: any) => {
    setProjectData({
      ...projectData,
      [field]: value,
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  const resetForm = () => {
    setProjectData(initialState);
    setStep(1);
    setCreationSuccess(false);
    setCreationStatus("");
    setIsCreating(false);
  };

  const handleCreateProject = async () => {
    // Validation
    if (!projectData.title || !projectData.csvFile || !projectData.dataContext) {
      console.error("Missing required fields");
      return;
    }

    // Set creating state
    setIsCreating(true);
    createOperationRef.current.inProgress = true;
    setCreationStatus("Preparing your project...");

    try {
      // The actual creation logic moved to service
      const result = await createProject(projectData, setCreationStatus);
      
      if (result.success) {
        setCreationSuccess(true);
        setTimeout(() => {
          if (createOperationRef.current.inProgress) {
            setIsCreating(false);
            createOperationRef.current.inProgress = false;
            onSuccessCallback();
          }
        }, 1500);
      } else {
        setCreationStatus(result.error || "An error occurred");
        setIsCreating(false);
        createOperationRef.current.inProgress = false;
      }
    } catch (error) {
      console.error("Error in project creation:", error);
      setCreationStatus("An unexpected error occurred. Please try again.");
      setIsCreating(false);
      createOperationRef.current.inProgress = false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      createOperationRef.current.inProgress = false;
    };
  }, []);

  // Check if current step can proceed
  const canProceed = () => {
    if (step === 1) return (projectData.title.trim().length > 0) && (projectData.sport);
    if (step === 3) return Boolean(projectData.csvFile) && projectData.dataContext.trim().length > 0;
    return true;
  };

  return {
    projectData,
    updateData,
    step,
    nextStep, 
    prevStep,
    resetForm,
    isCreating,
    creationStatus,
    creationSuccess,
    handleCreateProject,
    createOperationRef,
    canProceed
  };
}