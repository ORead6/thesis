"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/dashboard/SearchBar";
import ProjectCard from "@/components/dashboard/ProjectCard";
import NewProjectCard from "@/components/dashboard/NewProjectCard";
import { Inbox } from "lucide-react";
import type { Project } from "@/types/project";
import { createClient } from "@/utils/supabase/client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user's projects on component mount
  useEffect(() => {
    async function fetchUserProjects() {
      setLoading(true);
      const supabase = createClient();
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      // Fetch projects owned by the user
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("owner", userData.user.id);

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        // Transform Supabase data to match your Project type
        const formattedProjects = projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || null,
          icon: project.icon || "file-text",
          isFavourite: project.isFavourite || false,
          dataFilePath: project.dataFilePath || "",
          createdAt: project.createdAt || new Date().toISOString(),
          owner: project.owner,
          metadata: project.metadata || {}
        }));
        
        setProjects(formattedProjects);
      }
      
      setLoading(false);
    }

    fetchUserProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleCreateProject = () => {
    // This function is called from the NewProjectCard component
    // It will refresh the projects list after creating a new project
    refreshProjects();
  };

  const refreshProjects = async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.error("User not authenticated");
      return;
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner", userData.user.id);

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      const formattedProjects = projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || null,
        icon: project.icon || "file-text",
        isFavourite: project.isFavourite || false,
        dataFilePath: project.dataFilePath || "",
        createdAt: project.createdAt || new Date().toISOString(),
        owner: project.owner,
        metadata: project.metadata || {}
      }));
      
      setProjects(formattedProjects);
    }
  };

  const toggleFavourite = async (id: string) => {
    // Find the project to toggle
    const project = projects.find(p => p.id === id);
    if (!project) return;

    // Update locally first for immediate UI feedback
    setProjects(
      projects.map((project) =>
        project.id === id
          ? { ...project, isFavourite: !project.isFavourite }
          : project
      )
    );

    // Update in database
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ isFavourite: !project.isFavourite })
      .eq("id", id);

    if (error) {
      console.error("Error updating favourite status:", error);
      // Revert the local change if the server update failed
      refreshProjects();
    }
  };

  const deleteProject = async (id: string) => {
    // Update locally first for immediate UI feedback
    setProjects(projects.filter((project) => project.id !== id));

    // Delete from database
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      // Revert the local change if the server delete failed
      refreshProjects();
    }
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
        {loading ? (
          <div className="text-center py-10">Loading your projects...</div>
        ) : filteredProjects.length > 0 || !searchQuery ? (
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
                onToggleFavourite={toggleFavourite}
                onDelete={deleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              We couldn't find any projects that match your search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}