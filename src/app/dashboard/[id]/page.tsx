"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, BarChart4, PieChart, LineChart, Grid3X3, Settings, 
  Info, ChevronDown, X, Download, Filter, RefreshCw 
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from '@/utils/supabase/client';

type KPI = {
  header: string;
  value: string;
  explanation: string;
};

const DashboardBuilder = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<any>(null);
  const [kpiData, setKpiData] = useState<KPI[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call to fetch project data
        // const response = await fetch(`/api/projects/${projectId}`);
        // const data = await response.json();
        
        // Get project KPI's from API
        try {
          // Get userID in supabase
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (!data?.user) {
            return { success: false, error: "User not authenticated" };
          }

          let reqBody = { projectID: projectId, userID: data.user.id };
          
          const response = await fetch("/api/getProjectKPIs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
          });
          const responseData = await response.json();
          const kpiData = responseData.responses.KPIs

          console.log("KPI data:", kpiData);
          setKpiData(kpiData)
        } catch (error) {
          console.error("Error fetching KPI data:", error);
        }

        setProjectData({
          title: "Football Season Analytics",
          sport: "Football",
          description: "Complete analysis of team performance for the 2023-2024 season",
          createdAt: new Date().toISOString(),
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{projectData?.title}</h1>
          <p className="text-muted-foreground">{projectData?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Dashboard</DropdownMenuItem>
              <DropdownMenuItem>Share Dashboard</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Delete Dashboard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full" 
        onValueChange={(value) => setActiveTab(value)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="default" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </div>
        </div>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.header}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold" 
                    style={{color: `hsl(var(--chart-${(index % 5) + 1}))`}}>
                    {kpi.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.explanation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Performance Trends</CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <LineChart className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
                <CardDescription>Points distribution by quarter</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart4 className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Additional Charts */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Team Composition</CardTitle>
                <CardDescription>Player position distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Playing Time</CardTitle>
                <CardDescription>Minutes played per position</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart4 className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Injury Report</CardTitle>
                <CardDescription>Current team health status</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <Grid3X3 className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
          </div> */}
        </TabsContent>

        {/* Placeholder for other tabs */}
        <TabsContent value="performance" className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <BarChart4 className="mx-auto h-8 w-8 mb-2" />
            <p>Performance analysis content will appear here</p>
            <Button variant="outline" size="sm" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Performance Chart
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="players" className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Grid3X3 className="mx-auto h-8 w-8 mb-2" />
            <p>Player statistics content will appear here</p>
            <Button variant="outline" size="sm" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Player Chart
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <LineChart className="mx-auto h-8 w-8 mb-2" />
            <p>Team comparison content will appear here</p>
            <Button variant="outline" size="sm" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Comparison Chart
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardBuilder;