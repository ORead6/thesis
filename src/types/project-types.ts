// Types for the project creation flow
export interface ProjectFormData {
    title: string;
    description: string;
    dataContext: string;
    icon: string;
    csvFile: File | null;
  }
  
  export interface NewProjectCardProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newProject: { title: string; description: string };
    onNewProjectChange: (project: { title: string; description: string }) => void;
    onCreateProject: () => void;
  }
  
  export interface StepProps {
    projectData: ProjectFormData;
    updateData: (field: string, value: any) => void;
  }
  
  export interface ReviewStepProps extends StepProps {
    isCreating: boolean;
    creationStatus: string;
    creationSuccess: boolean;
  }
  
  export interface IconSelectorProps {
    selectedIcon: string;
    onIconChange: (iconId: string) => void;
  }