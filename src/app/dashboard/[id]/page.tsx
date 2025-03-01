"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Clock,
  Calendar,
  ArrowLeft,
  Download,
  Share2,
  Star,
  Activity,
  Timer,
  Medal,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getCurrentProject, getKPIData } from "../actions";
import { Loader2 } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ProjectPage() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [kpis, setKpis] = useState([
    { header: "Total Matches", value: "128", explanation: "+12 since last month" },
    { header: "Average Goals", value: "2.7", explanation: "-0.3 from last season" },
    { header: "Top Scorer", value: "17 goals", explanation: "Kane (Manchester United)" },
    { header: "Pass Accuracy", value: "86.2%", explanation: "+1.4% improvement" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function gettingCurrentProject() {
      if (!id) return;

      try {
        // Get project data from Supabase using the server action
        const response = await getCurrentProject(id as string);

        if (response.error) {
          console.error("Error fetching project:", response.error);
          return;
        }

        if (response.project) {
          setIsFavorite(response.project.metadata?.isFavourite || false);

          // Create a merged object with default values and actual data
          setProject({
            id: response.project.id,
            title: response.project.title,
            description: response.project.description || "No description available",
            createdAt: response.project.metadata?.createdAt
              ? new Date(response.project.metadata.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
              : new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
            members: 3, // You might want to fetch this data or keep it static
            charts: project.charts // Keep your mock chart definitions
          });
        }
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    }

    gettingCurrentProject();
  }, [id]);


  // Mock sports data dashboard project
  const [project, setProject] = useState({
    id,
    title: "",
    description: "",
    createdAt: "",
    members: 3,
    charts: [
      {
        id: "chart1",
        title: "Team Performance",
        type: "bar",
        description: "Win/loss ratio and points accumulated by each team"
      },
      {
        id: "chart2",
        title: "Player Metrics",
        type: "line",
        description: "Key player statistics over the last 10 matches"
      },
      {
        id: "chart3",
        title: "Goal Distribution",
        type: "pie",
        description: "Breakdown of goals by time period and play type"
      }
    ]
  });

  // Mock data for Team Performance bar chart
  const teamPerformanceData = {
    labels: ['Man City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham'],
    datasets: [
      {
        label: 'Wins',
        data: [18, 16, 15, 13, 12],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      },
      {
        label: 'Draws',
        data: [5, 6, 4, 8, 7],
        backgroundColor: 'rgba(241, 196, 15, 0.7)',
      },
      {
        label: 'Losses',
        data: [4, 5, 8, 6, 8],
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
      },
    ],
  };

  // Mock data for Player Metrics line chart
  const playerMetricsData = {
    labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5', 'Match 6', 'Match 7', 'Match 8', 'Match 9', 'Match 10'],
    datasets: [
      {
        label: 'Goals',
        data: [1, 0, 2, 0, 1, 2, 0, 1, 0, 1],
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Assists',
        data: [0, 1, 1, 0, 2, 0, 1, 0, 2, 0],
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        tension: 0.3,
      },
    ],
  };

  // Mock data for Goal Distribution pie chart
  const goalDistributionData = {
    labels: ['First Half', 'Second Half', 'Extra Time'],
    datasets: [
      {
        data: [38, 52, 10],
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for player rankings
  const playerRankingsData = {
    labels: ['Kane', 'Salah', 'Haaland', 'Son', 'De Bruyne'],
    datasets: [
      {
        label: 'Player Rating',
        data: [8.7, 8.5, 8.9, 8.1, 8.4],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      },
    ],
  };

  // Mock data for goal scorers
  const goalScorersData = {
    labels: ['Kane', 'Salah', 'Haaland', 'Son', 'De Bruyne', 'Others'],
    datasets: [
      {
        data: [22, 18, 24, 14, 9, 35],
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(149, 165, 166, 0.7)',
        ],
      },
    ],
  };

  // Mock data for minutes played
  const minutesPlayedData = {
    labels: ['Kane', 'Salah', 'Haaland', 'Son', 'De Bruyne'],
    datasets: [
      {
        label: 'Minutes Played',
        data: [1845, 1760, 1680, 1620, 1590],
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
      },
    ],
  };

  // Mock data for league table
  const leagueTableData = {
    labels: ['Man City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Man United', 'Newcastle'],
    datasets: [
      {
        label: 'Points',
        data: [59, 54, 49, 47, 43, 41, 39],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      },
    ],
  };

  // Mock data for team comparison
  const teamComparisonData = {
    labels: ['Goals Scored', 'Goals Conceded', 'Possession %', 'Pass Accuracy %', 'Shots per Game'],
    datasets: [
      {
        label: 'Man City',
        data: [58, 21, 67, 91, 18.3],
        backgroundColor: 'rgba(52, 152, 219, 0.5)',
      },
      {
        label: 'Arsenal',
        data: [52, 20, 58, 88, 16.7],
        backgroundColor: 'rgba(231, 76, 60, 0.5)',
      },
    ],
  };

  useEffect(() => {
    async function fetchKPIData() {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await getKPIData(id as string);

        if (response.success) {
          // Check if response has the expected structure
          if (response.success.kpis) {
            setKpis(response.success.kpis);
          } else if (Array.isArray(response.success)) {
            // Handle case where the response might be directly an array
            setKpis(response.success);
          } else {
            console.error("Unexpected KPI data structure:", response.success);
            // Set default KPIs or show message
          }
        } else {
          // Improved error logging
          console.error("Failed to load KPI data:",
            response.error,
            response.details ? `Details: ${response.details}` : '');
        }
      } catch (error) {
        console.error("Error loading KPI data:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }

    fetchKPIData();
  }, [id]);

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart3 className="h-5 w-5 text-primary" />;
      case "pie":
        return <PieChart className="h-5 w-5 text-primary" />;
      case "line":
        return <LineChart className="h-5 w-5 text-primary" />;
      default:
        return <BarChart3 className="h-5 w-5 text-primary" />;
    }
  };

  // Render the appropriate chart based on type
  const renderChart = (chartId: string) => {
    switch (chartId) {
      case "chart1":
        return <Bar data={teamPerformanceData} options={barOptions} />;
      case "chart2":
        return <Line data={playerMetricsData} options={lineOptions} />;
      case "chart3":
        return <Pie data={goalDistributionData} options={pieOptions} />;
      default:
        return <div>Chart not available</div>;
    }
  };

  return (
    <>
      {/* Full-page loading overlay with blur effect */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-xl font-medium">Loading dashboard data...</div>
            <div className="text-sm text-muted-foreground">Fetching analytics from S3 and database</div>
          </div>
        </div>
      )}

      <div className="space-y-8 pb-10">
        {/* Back link and project header */}
        <div className="flex flex-col space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-primary w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboards
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="border-border"
              >
                <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="default" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Last updated: {project.createdAt}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              {project.members} team analysts
            </div>
          </div>
        </div>

        {/* Dashboard tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Live updates
              </div>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{kpi.header}</CardDescription>
                    <CardTitle className="text-2xl">{kpi.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {kpi.explanation}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {project.charts.map(chart => (
                <Card key={chart.id} className="overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row items-start gap-4">
                    <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-3 mt-1 shadow-sm">
                      {getChartIcon(chart.type)}
                    </div>
                    <div>
                      <CardTitle>{chart.title}</CardTitle>
                      <CardDescription className="mt-1.5">{chart.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px] p-4">
                      {renderChart(chart.id)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Performance</CardTitle>
                <CardDescription>
                  Individual player metrics and performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Top Performers</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <Bar data={playerRankingsData} options={barOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Goal Scorers</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <Pie data={goalScorersData} options={pieOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Playing Time</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <Bar data={minutesPlayedData} options={barOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Analysis</CardTitle>
                <CardDescription>
                  Comparative analysis of team performance and tactics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">League Table</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <Bar data={leagueTableData} options={barOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Team Comparison</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <Bar data={teamComparisonData} options={barOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>
                  Configure visualization preferences and data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/30 dark:bg-accent/40 rounded-md">
                  <p className="text-muted-foreground">Settings options would appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}