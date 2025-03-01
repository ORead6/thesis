import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

// Import step components
import BasicInformationStep from './project-creation/BasicInformationStep';
import IconSelectionStep from "@/components/dashboard/project-creation/IconSelectionStep";
import DataUploadStep from '@/components/dashboard/project-creation/DataUploadStep';
import ReviewStep from '@/components/dashboard/project-creation/ReviewStep';
import ProjectCreationProgress from '@/components/dashboard/project-creation/ProjectCreationProgress';

// Import hook
import { useProjectCreation } from '@/hooks/useProjectCreation';
import { NewProjectCardProps } from '@/types/project-types';

const NewProjectCard: React.FC<NewProjectCardProps> = ({
  isOpen,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
}) => {
  // Use custom hook for most of the logic
  const {
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
    canProceed
  } = useProjectCreation(() => {
    // Success callback
    newProject.title = projectData.title;
    newProject.description = projectData.description;
    onNewProjectChange({
      title: projectData.title,
      description: projectData.description,
    });
    onCreateProject();
    resetForm();
    onOpenChange(false);
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleDialogChange = (open: boolean) => {
    // If creation is in progress, prevent the modal from closing
    if (isCreating && !open) {
      return;
    }

    // If dialog is being closed, reset all progress states
    if (!open) {
      resetForm();
    }

    // Otherwise close/open normally
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden transition-all hover:shadow-xl border-dashed border-2 border-primary/30 hover:border-primary dark:border-primary/20 dark:hover:border-primary/60 h-[200px] flex flex-col cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4 mb-4 transform group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-primary dark:text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1 text-foreground dark:text-foreground">Create New Project</h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Add a new project to your dashboard
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6 rounded-lg shadow-xl bg-background max-h-[90vh] overflow-hidden will-change-transform">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 && "Step 1: Basic information"}
            {step === 2 && "Step 2: Choose a project icon"}
            {step === 3 && "Step 3: Upload project data"}
            {step === 4 && "Step 4: Review and create"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <ProjectCreationProgress step={step} />

        {/* Scrollable content container */}
        <div className="min-h-[250px] max-h-full">
          {/* Render the appropriate step component */}
          {step === 1 && <BasicInformationStep projectData={projectData} updateData={updateData} />}
          {step === 2 && <IconSelectionStep projectData={projectData} updateData={updateData} />}
          {step === 3 && <DataUploadStep projectData={projectData} updateData={updateData} />}
          {step === 4 && (
            <ReviewStep 
              projectData={projectData} 
              updateData={updateData} 
              isCreating={isCreating} 
              creationStatus={creationStatus} 
              creationSuccess={creationSuccess} 
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="mt-6 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                type="button"
                className="px-4 py-2"
                disabled={isCreating}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleDialogChange(false)}
                type="button"
                className="px-4 py-2"
                disabled={isCreating && !creationSuccess}
              >
                Cancel
              </Button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                type="button"
                className="px-6 py-2"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateProject}
                disabled={isCreating}
                type="button"
                className="px-6 py-2"
              >
                {isCreating ? (
                  <>
                    Creating
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Create Project
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectCard;