"use client";

import React, { useState } from "react";
import SearchBar from "@/components/dashboard/SearchBar";
import ProjectCard from "@/components/dashboard/ProjectCard";
import NewProjectCard from "@/components/dashboard/NewProjectCard";
import { Inbox } from "lucide-react";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Website Redesign",
      description: "Complete overhaul of the company website",
      isFavorite: true,
    },
    {
      id: "2",
      title: "Mobile App",
      description: null,
      isFavorite: false,
    },
    // Additional sample projects...
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleCreateProject = () => {
    if (newProject.title.trim()) {
      const newProjectObject = {
        id: Math.random().toString(36).substr(2, 9),
        title: newProject.title,
        description: newProject.description || null,
        isFavorite: false,
      };
      
      setProjects(prevProjects => [...prevProjects, newProjectObject]);
      setNewProject({ title: "", description: "" });
    }
  };

  const toggleFavorite = (id: string) => {
    setProjects(
      projects.map((project) =>
        project.id === id
          ? { ...project, isFavorite: !project.isFavorite }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  return (
    <div className="px-6 py-6 w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team projects and track progress
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Projects Container */}
      <div className="w-full">
        {filteredProjects.length > 0 || !searchQuery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Card - always first in the grid */}
            {!searchQuery && (
              <NewProjectCard
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                newProject={newProject}
                onNewProjectChange={setNewProject}
                onCreateProject={handleCreateProject}
              />
            )}
            
            {/* Project Cards */}
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-card border border-dashed rounded-lg flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try adjusting your search to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}