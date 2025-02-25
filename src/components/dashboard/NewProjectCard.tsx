"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowLeft, ArrowRight, CheckCircle, FileUp, LayoutGrid, FileText, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NewProjectCardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: { title: string; description: string };
  onNewProjectChange: (project: { title: string; description: string }) => void;
  onCreateProject: () => void;
}

const ICONS = [
  { id: "layout", icon: <LayoutGrid className="h-5 w-5" /> },
  { id: "file", icon: <FileText className="h-5 w-5" /> },
  { id: "settings", icon: <Settings className="h-5 w-5" /> },
  { id: "check", icon: <CheckCircle className="h-5 w-5" /> },
];

// Initial state for form data
const initialState = {
  title: "",
  description: "",
  icon: "layout",
  csvFile: null as File | null,
};

const NewProjectCard: React.FC<NewProjectCardProps> = ({
  isOpen,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
}) => {
  // State for multi-step process
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState(initialState);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset state completely when dialog closes
      setProjectData(initialState);
      setStep(1);
    }
  }, [isOpen]);
  
  // Handle form navigation
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  // Update form data
  const updateData = (field: string, value: any) => {
    setProjectData({
      ...projectData,
      [field]: value,
    });
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData("csvFile", e.target.files[0]);
    }
  };
  
  // Handle creation confirmation
  const handleCreate = () => {
    // Update parent state first 
    newProject.title = projectData.title;
    newProject.description = projectData.description;

    onNewProjectChange({
      title: projectData.title,
      description: projectData.description,
    });
    
    onCreateProject();
    
    // Close the dialog - this will also reset the form via the useEffect
    onOpenChange(false);
  };
  
  // Handle dialog close
  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
  };
  
  // Determine if we can proceed to next step
  const canProceed = () => {
    if (step === 1) return projectData.title.trim().length > 0;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-dashed border-2 border-primary/30 hover:border-primary dark:border-primary/20 dark:hover:border-primary/60 h-[200px] flex flex-col cursor-pointer">
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
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {step === 1 && "Step 1: Basic information"}
            {step === 2 && "Step 2: Choose a project icon"}
            {step === 3 && "Step 3: Upload project data"}
            {step === 4 && "Step 4: Review and create"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="w-full mb-4">
          <div className="flex justify-between mb-1">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  stepNumber === step 
                    ? "bg-primary text-primary-foreground" 
                    : stepNumber < step 
                    ? "bg-primary/70 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted h-1 rounded-full">
            <div 
              className="bg-primary h-1 rounded-full transition-all" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">Project Title</Label>
              <Input
                id="title"
                value={projectData.title}
                onChange={(e) => updateData("title", e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => updateData("description", e.target.value)}
                placeholder="Enter project description (optional)"
                rows={4}
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Choose Icon */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <Label>Select a project icon</Label>
            <RadioGroup 
              value={projectData.icon} 
              onValueChange={(value) => updateData("icon", value)}
              className="grid grid-cols-2 gap-4"
            >
              {ICONS.map((icon) => (
                <div key={icon.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={icon.id} id={`icon-${icon.id}`} className="peer sr-only" />
                  <Label 
                    htmlFor={`icon-${icon.id}`}
                    className="flex items-center justify-center bg-muted border rounded-md p-4 hover:bg-muted/80 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 w-full h-20"
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {icon.icon}
                      </div>
                      <span className="text-xs capitalize">{icon.id}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {/* Step 3: Upload CSV */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <Label htmlFor="csv-upload">Upload project data (CSV)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Input 
                id="csv-upload"
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="font-medium">Click to upload</span>
                  <span className="text-sm text-muted-foreground">
                    {projectData.csvFile ? projectData.csvFile.name : "CSV files only"}
                  </span>
                </div>
              </Label>
            </div>
          </div>
        )}
        
        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <h3 className="font-medium text-lg">Review Project Details</h3>
            <div className="bg-muted rounded-md p-4 space-y-3">
              <div className="flex items-center gap-3">
                {ICONS.find(icon => icon.id === projectData.icon)?.icon}
                <div>
                  <p className="font-medium">{projectData.title}</p>
                  <p className="text-sm text-muted-foreground">{projectData.description || "No description provided"}</p>
                </div>
              </div>
              {projectData.csvFile && (
                <div className="text-sm">
                  <span className="font-medium">Data file:</span> {projectData.csvFile.name}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        <DialogFooter className="flex items-center justify-between mt-4">
          <div>
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => handleDialogChange(false)} type="button">
                Cancel
              </Button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <Button onClick={nextStep} disabled={!canProceed()} type="button">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} type="button">
                Create Project
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectCard;