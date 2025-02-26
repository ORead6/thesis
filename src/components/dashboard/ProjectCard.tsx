"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, FolderGit2, Clock, Users } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleFavourite, onDelete }) => {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-l-4 hover:border-l-primary dark:border-l-accent dark:hover:border-l-primary h-[200px] flex flex-col">
      <CardHeader className="relative pb-2">
        <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavourite(project.id)}
            className="h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-full"
            aria-label={project.isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Star
              className={`h-4 w-4 transition-all ${project.isFavourite
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground hover:text-yellow-400"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(project.id)}
            className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
            aria-label="Delete project"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-3 mt-1 shadow-sm">
            <FolderGit2 className="h-5 w-5 text-primary dark:text-primary" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="line-clamp-1 text-lg text-foreground dark:text-foreground">{project.title}</CardTitle>
              {project.isFavourite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            {project.description && (
              <CardDescription className="line-clamp-2 text-sm text-muted-foreground dark:text-muted-foreground">
                {project.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t border-border dark:border-border bg-muted/30 dark:bg-accent/40 py-3 mt-auto">
        <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>2 days ago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>2 members</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;