"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Clock, Users } from "lucide-react";
import type { Project } from "@/types/project";
import ICONS from "@/components/dashboard/availableIcons";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: Project;
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleFavourite, onDelete }) => {
  const router = useRouter();
  const isFavorite = project.isFavourite || project.metadata?.isFavourite;

  // Find the icon component based on the icon stored in metadata
  const iconId = project.metadata?.icon || project.icon || "file-text";
  const IconComponent = ICONS.find(icon => icon.id === iconId)?.icon ||
    ICONS.find(icon => icon.id === "file-text")?.icon;

  // Handle card click
  const handleCardClick = () => {
    router.push(`/dashboard/${project.id}`);
  };

  // Handle button clicks with stopPropagation
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavourite(project.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <Card onClick={handleCardClick} className="group relative overflow-hidden transition-all hover:shadow-lg border-l-4 hover:border-l-primary dark:border-l-accent dark:hover:border-l-primary h-[200px] flex flex-col">
      <CardHeader className="relative pb-2">
        <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={isFavorite ? "text-yellow-500" : ""}
          >
            <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10 text-primary dark:bg-primary/20">
            {IconComponent}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{project.title}</CardTitle>
              {isFavorite && (
                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
              )}
            </div>
            <CardDescription className="line-clamp-1 text-xs mt-0.5">
              {project.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end pb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">
              {new Date(project.metadata?.createdAt || project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">Owner</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;