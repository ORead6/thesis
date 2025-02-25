"use client";

import React, { useState } from "react";
import SearchBar from "@/components/dashboard/SearchBar";
import NewProjectDialog from "@/components/dashboard/NewProjectDialog";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Inbox } from "lucide-react";
import type { Project } from "@/types/project";
import SideNav from "@/components/dashboard/SideNav";

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
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProject.title.trim()) {
      setProjects([
        ...projects,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: newProject.title,
          description: newProject.description || null,
          isFavorite: false,
        },
      ]);
      setNewProject({ title: "", description: "" });
      setIsDialogOpen(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, isFavorite: !project.isFavorite } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Projects</h1>
        <p className="text-lg text-muted-foreground">
          Manage your team projects and track progress
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="w-min-[100%] flex flex-col sm:flex-row gap-4 items-center justify-between dark:bg-slate-900/60 rounded-lg p-3 border shadow-md">
        <div className="w-min-[100%] flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <NewProjectDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          newProject={newProject}
          onNewProjectChange={setNewProject}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Projects Container */}
      <div className="w-full">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="w-full bg-card border border-dashed rounded-lg flex flex-col items-center justify-center py-20 text-center min-h-[400px]">
            <div className="bg-muted rounded-full p-5 mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : "Create your first project to get started with your team."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
