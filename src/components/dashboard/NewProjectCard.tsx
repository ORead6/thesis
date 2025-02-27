"use client";

import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRef } from "react";
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
import ICONS from "@/components/dashboard/availableIcons";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getSignedURL } from "@/app/dashboard/actions";
import { KPIGenerator } from "@/utils/openai/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewProjectCardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: { title: string; description: string };
  onNewProjectChange: (project: { title: string; description: string }) => void;
  onCreateProject: () => void;
}

const initialState = {
  title: "",
  description: "",
  dataContext: "",  // Added data context field
  icon: "activity",
  csvFile: null as File | null,
};

const NewProjectCard: React.FC<NewProjectCardProps> = ({
  isOpen,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
}) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState(initialState);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState("");
  const [creationSuccess, setCreationSuccess] = useState(false);
  const createOperationRef = useRef<{ inProgress: boolean }>({ inProgress: false });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProjectData(initialState);
      setStep(1);
      setIconDropdownOpen(false);
    }
  }, [isOpen]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const filteredIcons = iconSearchQuery.trim() === ""
    ? ICONS
    : ICONS.filter(icon =>
      icon.id.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      (icon.label && icon.label.toLowerCase().includes(iconSearchQuery.toLowerCase()))
    );

  const updateData = (field: string, value: any) => {
    setProjectData({
      ...projectData,
      [field]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData("csvFile", e.target.files[0]);
    }
  };

  const handleCreate = () => {
    // Update parent component data
    newProject.title = projectData.title;
    newProject.description = projectData.description;
    onNewProjectChange({
      title: projectData.title,
      description: projectData.description,
    });
    onCreateProject();

    // Reset all progress states
    setCreationSuccess(false);
    setCreationStatus("");
    setIsCreating(false);
    setProjectData(initialState);
    setStep(1);

    // Close the dialog
    onOpenChange(false);
  };

  const handleCreateProject = async () => {
    // Validate required fields
    if (!projectData.title || !projectData.csvFile || !projectData.dataContext) {
      console.error("Missing required fields");
      return;
    }

    // Set creating state and reference
    setIsCreating(true);
    createOperationRef.current.inProgress = true;
    setCreationStatus("Preparing your project...");

    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data) {
        console.error("User not authenticated");
        setCreationStatus("Authentication error. Please try again.");
        setIsCreating(false);
        return;
      }

      const userData = data.user;

      setCreationStatus("Creating project database entry...");
      const uuid = uuidv4();
      const supabaseFilePath = `projects/${userData!.id}/${uuid}`;

      const projectDataForDB = {
        id: uuid,
        title: projectData.title,
        description: projectData.description,
        owner: userData!.id,
        metadata: {
          isFavourite: false,
          icon: projectData.icon,
          dataFilePath: supabaseFilePath,
          dataContext: projectData.dataContext,  // Store data context
          createdAt: new Date().toISOString(),
        }
      };

      const { error } = await supabase.from("projects").insert([projectDataForDB]);

      if (error) {
        console.error("Error creating project", error);
        setCreationStatus("Error creating project. Please try again.");
        setIsCreating(false);
        return;
      }

      setCreationStatus("Uploading data file...");
      const uploadURLResult = await getSignedURL(uuid);

      if (!uploadURLResult?.success) {
        console.log("URL NOT CREATED SUCCESSFULLY");
        setCreationStatus("Error preparing upload. Please try again.");
        setIsCreating(false);
        return;
      }

      const uploadURL = uploadURLResult.success.url;

      await fetch(uploadURL, {
        method: "PUT",
        // Remove any headers that might interfere with the signature
        body: projectData.csvFile
      });

      setCreationStatus("Upload successful! Finalizing your project...");

      // Where we do OPEN AI STUFFS
      setCreationStatus("Generating KPIs");

      const csvContent = await projectData.csvFile.text();

      // Use dataContext instead of description for AI generation
      const result = await KPIGenerator(userData!.id, uuid, csvContent, projectData.dataContext);

      // Show success state for 1.5 seconds before closing
      setCreationSuccess(true);
      setTimeout(() => {
        if (createOperationRef.current.inProgress) {
          setIsCreating(false);
          setCreationStatus("");
          createOperationRef.current.inProgress = false;
          handleCreate(); // This will reset everything and close the dialog
        }
      }, 1500);

    } catch (error) {
      console.error("Error in project creation:", error);
      setCreationStatus("An unexpected error occurred. Please try again.");
      setIsCreating(false);
      createOperationRef.current.inProgress = false;
    }
  };

  useEffect(() => {
    return () => {
      createOperationRef.current.inProgress = false;
    };
  }, []);

  const handleDialogChange = (open: boolean) => {
    // If creation is in progress, prevent the modal from closing
    if (isCreating && !open) {
      // Just show a message that creation will continue in background
      setCreationStatus("Creating project in background...");
      return;
    }

    // If dialog is being closed, reset all progress states
    if (!open) {
      setCreationSuccess(false);
      setCreationStatus("");
      setIsCreating(false);
      setProjectData(initialState);
      setStep(1);
    }

    // Otherwise close/open normally
    onOpenChange(open);
  };

  const canProceed = () => {
    if (step === 1) return projectData.title.trim().length > 0;
    if (step === 3) return Boolean(projectData.csvFile) && projectData.dataContext.trim().length > 0;
    return true;
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

        {/* Progress Indicator - Improved visibility */}
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${stepNumber === step
                  ? "bg-primary text-primary-foreground border-primary-foreground"
                  : stepNumber < step
                    ? "bg-primary/80 text-primary-foreground border-primary/30"
                    : "bg-muted text-foreground border-muted-foreground/50"
                  }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable content container */}
        <ScrollArea className="pr-4 max-h-[50vh]">
          <div className="min-h-[250px] max-h-full">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={projectData.title}
                    onChange={(e) => updateData("title", e.target.value)}
                    placeholder="Enter project title"
                    className="shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    value={projectData.description}
                    onChange={(e) => updateData("description", e.target.value)}
                    placeholder="Enter a short description of this project"
                    rows={3}
                    className="shadow-sm focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">A brief description for the dashboard</p>
                </div>
              </div>
            )}

            {/* Step 2: Choose Icon */}
            {step === 2 && (
              <div className="space-y-6 py-4">
                <Label className="font-medium">Select a project icon</Label>

                {/* Custom dropdown for icon selection */}
                <div className="relative">
                  {/* Selected icon display */}
                  <button
                    type="button"
                    onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                    className="flex items-center justify-between w-full p-4 bg-muted border rounded-lg hover:bg-muted/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      {ICONS.find(icon => icon.id === projectData.icon)?.icon}
                      <span className="text-sm capitalize">{projectData.icon}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${iconDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Icon dropdown */}
                  {iconDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full max-h-[300px] overflow-y-auto border rounded-lg bg-background shadow-lg">
                      <div className="sticky top-0 bg-background border-b p-2">
                        <Input
                          placeholder="Search icons..."
                          value={iconSearchQuery}
                          onChange={(e) => setIconSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 p-2">
                        {filteredIcons.map((icon) => (
                          <div
                            key={icon.id}
                            className={cn(
                              "flex flex-col items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                              projectData.icon === icon.id && "bg-primary/10 border border-primary"
                            )}
                            onClick={() => {
                              updateData("icon", icon.id);
                              setIconDropdownOpen(false);
                            }}
                          >
                            {icon.icon}
                          </div>
                        ))}
                      </div>
                      {filteredIcons.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No icons match your search
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected icon preview */}
                <div className="mt-6">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview</Label>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg">
                    <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center">
                      {ICONS.find(icon => icon.id === projectData.icon)?.icon}
                    </div>
                    <div>
                      <p className="font-medium">{projectData.title || "Project Title"}</p>
                      <p className="text-xs text-muted-foreground">with {projectData.icon} icon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Upload CSV */}
            {step === 3 && (
              <div className="space-y-6 py-4">
                <div className="space-y-2 mb-4">
                  <Label htmlFor="data-context" className="font-medium">
                    Data Context <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="data-context"
                    value={projectData.dataContext}
                    onChange={(e) => updateData("dataContext", e.target.value)}
                    placeholder="Describe what this data represents, important columns, and any context that would help understand the dataset"
                    rows={4}
                    className="shadow-sm focus:ring-primary focus:border-primary max-h-[200px] overflow-y-auto"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This information is crucial for generating accurate and relevant KPIs from your data.
                    Include column descriptions, data timeframes, measurement units, etc.
                  </p>
                </div>

                <Label htmlFor="csv-upload" className="font-medium">
                  Upload project data (CSV) <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
                    "hover:border-primary",
                    projectData.csvFile ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
                        updateData("csvFile", file);
                      }
                    }
                  }}
                >
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="csv-upload" className="cursor-pointer block w-full h-full">
                    <div className="flex flex-col items-center">
                      <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="font-medium text-lg">
                        {projectData.csvFile ? "File selected" : "Drop CSV here or click to upload"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {projectData.csvFile ? projectData.csvFile.name : "CSV files only (required)"}
                      </span>
                    </div>
                  </Label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6 py-4">
                {isCreating ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    {creationSuccess ? (
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-xl">Project Created Successfully!</h3>
                        <p className="text-muted-foreground">Redirecting to your new project...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <h3 className="font-semibold text-xl">Creating Your Project</h3>
                        <p className="text-muted-foreground">{creationStatus}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-xl">Review Project Details</h3>
                    <div className="bg-muted rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {ICONS.find(icon => icon.id === projectData.icon)?.icon}
                        <div>
                          <p className="font-bold text-lg">{projectData.title}</p>
                          <p className="text-sm text-muted-foreground">{projectData.description}</p>
                        </div>
                      </div>
                      {projectData.csvFile && (
                        <div className="text-sm mt-3">
                          <span className="font-medium">Data file:</span> {projectData.csvFile.name}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium mb-2">Data Context:</p>
                        <div className="text-sm bg-background p-3 rounded-md max-h-[120px] overflow-y-auto">
                          {projectData.dataContext}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

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