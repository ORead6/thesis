"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
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

interface NewProjectCardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: { title: string; description: string };
  onNewProjectChange: (project: { title: string; description: string }) => void;
  onCreateProject: () => void;
}

const NewProjectCard: React.FC<NewProjectCardProps> = ({
  isOpen,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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

export default NewProjectCard;