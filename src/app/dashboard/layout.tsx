import React from "react";
import SideNav from "@/components/dashboard/SideNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen min-w-[100%]">
        <SideNav className="shrink-0" />
        <main className="flex-1 px-4 md:px-6 pt-16 md:pt-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}