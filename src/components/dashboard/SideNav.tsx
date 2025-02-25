"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderGit2,
  Users2,
  Settings,
  BarChart3,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavUser } from "./nav-user";

interface SideNavProps {
  className?: string;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: <FolderGit2 className="w-5 h-5" />,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: <Users2 className="w-5 h-5" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

const SideNav: React.FC<SideNavProps> = ({ className }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle resize events to determine mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close nav when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navElement = document.getElementById('mobile-nav');
      const toggleButton = document.getElementById('nav-toggle-button');

      // Don't close if clicking the toggle button itself
      if (toggleButton && toggleButton.contains(event.target as Node)) {
        return;
      }

      if (isMobileView && isOpen && navElement && !navElement.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobileView]);

  // Close the sidebar when route changes on mobile
  useEffect(() => {
    if (isMobileView) {
      setIsOpen(false);
    }
  }, [pathname, isMobileView]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);

    // Remove focus from the button to fix hover state issue
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b md:hidden">
        <Button
          id="nav-toggle-button"
          variant="ghost"
          size="icon"
          className="md:hidden focus:outline-none focus:ring-0"
          onClick={handleToggle}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <div className="font-semibold">Dashboard</div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Navigation Sidebar */}
      <nav
        id="mobile-nav"
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-all duration-200 ease-in-out bg-background border-r",
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          "md:translate-x-0 md:shadow-none md:sticky md:top-0 md:h-screen",
          "pt-16 md:pt-0", // Add padding for mobile header
          className
        )}
      >
        <div className="flex flex-col h-full py-6 px-3 overflow-y-auto">
          <div className="px-3 py-2 mb-6 hidden md:block">
            <h2 className="text-lg font-semibold">Navigation</h2>
          </div>
          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-primary",
                    "border-l-4",
                    isActive
                      ? "border-l-primary"
                      : "border-transparent hover:border-l-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.title}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-70 group-hover:translate-x-0" />
                </Link>
              );
            })}

          </div>

          {/* Account Settings - Now visible on all screen sizes */}
          <div className="mt-auto pt-6">
            <div className="border-t border-border pt-4 px-3">
              <NavUser
                user={{
                  name: "John Doe",
                  email: "",
                  avatar: ""
                }} />
            </div>
          </div>

        </div>
      </nav>

      {/* Backdrop for mobile - separate from the nav for better touch handling */}

      {isOpen && isMobileView && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SideNav;