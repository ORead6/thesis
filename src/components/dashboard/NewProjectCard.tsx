"use client";

import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
import ICONS from "@/components/dashboard/availableIcons";

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
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState(initialState);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProjectData(initialState);
      setStep(1);
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
    newProject.title = projectData.title;
    newProject.description = projectData.description;
    onNewProjectChange({
      title: projectData.title,
      description: projectData.description,
    });
    onCreateProject();
    onOpenChange(false);
  };

  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
  };

  const canProceed = () => {
    if (step === 1) return projectData.title.trim().length > 0;
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

      <DialogContent className="sm:max-w-[500px] p-6 rounded-lg shadow-xl bg-background">
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

        {/* Fixed height content container */}
        <div className="min-h-[320px]">
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
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={projectData.description}
                  onChange={(e) => updateData("description", e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows={4}
                  className="shadow-sm focus:ring-primary focus:border-primary"
                />
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
              <Label htmlFor="csv-upload" className="font-medium">Upload project data (CSV)</Label>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 text-center hover:border-primary transition-colors">
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
                    <span className="font-medium text-lg">Click to upload</span>
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
            <div className="space-y-6 py-4">
              <h3 className="font-semibold text-xl">Review Project Details</h3>
              <div className="bg-muted rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  {ICONS.find(icon => icon.id === projectData.icon)?.icon}
                  <div>
                    <p className="font-bold text-lg">{projectData.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {projectData.description || "No description provided"}
                    </p>
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
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="mt-6 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} type="button" className="px-4 py-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => handleDialogChange(false)} type="button" className="px-4 py-2">
                Cancel
              </Button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <Button onClick={nextStep} disabled={!canProceed()} type="button" className="px-6 py-2">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} type="button" className="px-6 py-2">
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
