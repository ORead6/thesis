import React from "react";
import SideNav from "@/components/dashboard/SideNav";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SideNav className="shrink-0" />
        <main className="flex-1 px-4 md:px-6 pt-16 md:pt-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}