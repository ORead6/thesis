"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: { title: string; description: string };
  onNewProjectChange: (project: { title: string; description: string }) => void;
  onCreateProject: () => void;
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  isOpen,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new project to your dashboard.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={newProject.title}
              onChange={(e) =>
                onNewProjectChange({ ...newProject, title: e.target.value })
              }
              placeholder="Enter project title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newProject.description}
              onChange={(e) =>
                onNewProjectChange({ ...newProject, description: e.target.value })
              }
              placeholder="Enter project description (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreateProject}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
