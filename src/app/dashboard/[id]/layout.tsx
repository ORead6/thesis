// src/app/dashboard/[id]/layout.tsx
"use client";

import React, { useState } from "react";
import { X, Bot } from "lucide-react"; // Import the Bot and X icons
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChatBot } from "@/components/dashboard/ChatBot";

export default function ProjectLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsRightSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-1 relative h-full">
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isRightSidebarOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        {children}
      </div>

      <Button
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 z-30 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary hover:bg-primary/90 border-2 border-primary-foreground/20",
          "hover:scale-110",
          isRightSidebarOpen
            ? "right-[280px] md:right-72" // Position when sidebar is open
            : "right-6" // Position when sidebar is closed
        )}
        onClick={toggleSidebar}
      >
        <Bot className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
        <span className="sr-only">
          {isRightSidebarOpen ? "Close chat assistant" : "Open chat assistant"}
        </span>
      </Button>


      {/* Right sidebar */}
      <aside className={cn(
        "fixed top-0 right-0 z-20 h-screen border-l bg-background shadow-sm transition-all duration-300 ease-in-out",
        "mt-[57px] md:mt-0", // Account for header height on mobile
        isRightSidebarOpen ? "translate-x-0 w-64" : "translate-x-full w-64"
      )}>
        <ChatBot onClose={() => setIsRightSidebarOpen(false)} />
      </aside>
    </div>
  );
}