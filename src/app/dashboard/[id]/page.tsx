"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, BarChart4, PieChart, LineChart, Grid3X3, Settings, Info, ChevronDown, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// You'll need to create these server actions in your actions.ts file
import { saveDashboardConfig, getDashboardConfig } from '@/app/dashboard/actions';

const DashboardBuilder = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardComponents, setDashboardComponents] = useState<any[]>([]);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref to track if dashboard has been modified since last save
  const isDirtyRef = useRef(false);
  // Ref to hold the latest dashboard configuration
  const dashboardConfigRef = useRef<any>(null);
  // Ref to track if initial loading is complete
  const initialLoadCompleteRef = useRef(false);

  const steps = [
    { title: 'Welcome to Your Dashboard', description: 'This guide will help you create a valuable dashboard tailored to your needs.' },
    { title: 'Add Components', description: 'Click the + button to add charts, tables, or KPI cards that matter to you.' },
    { title: 'Customize Layout', description: 'Drag components to rearrange. Resize using the size dropdown in each component.' },
    { title: 'Configure Data', description: 'Click the settings icon on each component to connect it to your data sources.' },
  ];

  const componentTypes = [
    { type: 'lineChart', icon: <LineChart className="h-8 w-8 text-blue-500" />, title: 'Line Chart', description: 'Track changes over time' },
    { type: 'barChart', icon: <BarChart4 className="h-8 w-8 text-green-500" />, title: 'Bar Chart', description: 'Compare values across categories' },
    { type: 'pieChart', icon: <PieChart className="h-8 w-8 text-purple-500" />, title: 'Pie Chart', description: 'Show composition of data' },
    { type: 'dataTable', icon: <Grid3X3 className="h-8 w-8 text-gray-500" />, title: 'Data Table', description: 'View detailed records' },
    { type: 'kpiCard', icon: <Info className="h-8 w-8 text-amber-500" />, title: 'KPI Card', description: 'Track key performance indicators' },
  ];

  // Update the dashboard config ref when state changes
  useEffect(() => {
    // Don't mark as dirty during initial load
    if (initialLoadCompleteRef.current) {
      isDirtyRef.current = true;
      
      // Update the dashboard config ref with current state
      dashboardConfigRef.current = {
        components: dashboardComponents,
        welcomeGuide: {
          show: showWelcomeGuide,
          currentStep: currentStep,
        },
        activeTab: activeTab,
        lastUpdated: new Date().toISOString(),
      };
    }
  }, [dashboardComponents, showWelcomeGuide, currentStep, activeTab]);

  // Function to save dashboard configuration to S3
  const saveDashboardState = async () => {
    if (!isDirtyRef.current || !dashboardConfigRef.current) {
      return; // Nothing to save
    }
    
    try {
      await saveDashboardConfig(projectId, dashboardConfigRef.current);
      isDirtyRef.current = false; // Reset the dirty flag after successful save
      console.log("Dashboard configuration saved to S3");
    } catch (error) {
      console.error("Error saving dashboard configuration:", error);
    }
  };

  // Load dashboard configuration on component mount
  useEffect(() => {
    const loadDashboardConfig = async () => {
      setIsLoading(true);
      try {
        const config = await getDashboardConfig(projectId);

        // Debug the response
        console.log("Dashboard config response:", config);

        if (config && 'success' in config && config.success) {
          // Apply saved configuration
          const savedConfig = config.success;

          if (savedConfig.components && Array.isArray(savedConfig.components)) {
            setDashboardComponents(savedConfig.components);
          }

          if (savedConfig.welcomeGuide) {
            setShowWelcomeGuide(savedConfig.welcomeGuide.show);
            setCurrentStep(savedConfig.welcomeGuide.currentStep || 0);
          }

          if (savedConfig.activeTab) {
            setActiveTab(savedConfig.activeTab);
          }
          
          // Initialize the config ref with loaded data
          dashboardConfigRef.current = savedConfig;
        } else if (config && 'error' in config) {
          console.error("Error in dashboard config:", config.error);
        }
      } catch (error) {
        console.error("Error loading dashboard configuration:", error);

      } finally {
        // Add a slight delay to ensure the UI has time to update
        setTimeout(() => {
          setIsLoading(false);
          initialLoadCompleteRef.current = true;
        }, 500);
      }
    };

    loadDashboardConfig();
  }, [projectId, toast]);

  // Save on navigation or page close
  useEffect(() => {
    // Function to handle before unload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        // Save the dashboard state before unloading
        saveDashboardState();
        
        // The following is for showing a confirmation dialog, but modern browsers
        // ignore custom messages and show their own standard message
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save changes when component unmounts
      if (isDirtyRef.current) {
        saveDashboardState();
      }
    };
  }, []);

  // Use the useEffect to detect when the component might unmount
  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        saveDashboardState();
      }
    };
  }, []);

  // Add periodic saving as a fallback (e.g., every 5 minutes)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDirtyRef.current) {
        saveDashboardState();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Add a manual save button functionality
  const handleManualSave = () => {
    saveDashboardState();
  };

  // Your existing functions
  const addComponent = (type: any) => {
    const newComponent = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: 'Click to configure',
      size: 'md'
    };
    setDashboardComponents([...dashboardComponents, newComponent]);
    setIsAddComponentOpen(false);
  };

  const removeComponent = (id: any) => {
    setDashboardComponents(dashboardComponents.filter((comp: any) => comp.id !== id));
  };

  // New function to update component size
  const updateComponentSize = (id: string, newSize: string) => {
    setDashboardComponents(
      dashboardComponents.map((comp: any) => 
        comp.id === id ? { ...comp, size: newSize } : comp
      )
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowWelcomeGuide(false);
    }
  };

  const renderComponentIcon = (type: any) => {
    switch (type) {
      case 'lineChart': return <LineChart className="h-5 w-5" />;
      case 'barChart': return <BarChart4 className="h-5 w-5" />;
      case 'pieChart': return <PieChart className="h-5 w-5" />;
      case 'dataTable': return <Grid3X3 className="h-5 w-5" />;
      case 'kpiCard': return <Info className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getComponentSizeClass = (size: any) => {
    switch (size) {
      case 'sm': return 'col-span-1';
      case 'md': return 'col-span-2';
      case 'lg': return 'col-span-3';
      case 'xl': return 'col-span-4';
      default: return 'col-span-2';
    }
  };

  const getComponentHeightClass = (size: any) => {
    switch (size) {
      case 'sm': return 'h-48'; // Small height
      case 'md': return 'h-64'; // Medium height
      case 'lg': return 'h-80'; // Large height
      case 'xl': return 'h-96'; // Extra large height
      default: return 'h-64';   // Default medium height
    }
  };

  // Helper to get size display name
  const getSizeDisplayName = (size: string) => {
    switch (size) {
      case 'sm': return 'Small';
      case 'md': return 'Medium';
      case 'lg': return 'Large';
      case 'xl': return 'Extra Large';
      default: return 'Medium';
    }
  };

  return (
    <div className="px-6 py-6 w-full relative">
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <span className="mt-4 text-muted-foreground">
              Loading your dashboard, please wait...
            </span>
          </div>
        </div>
      )}

      <div className="px-6 py-6 w-full">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Your Data Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visualize and analyze your data with customizable components
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleManualSave}
            disabled={!isDirtyRef.current}
          >
            {isDirtyRef.current ? "Save Changes" : "All Changes Saved"}
          </Button>
        </div>

        {/* Tabs Navigation with Add Component button inline */}
        <div className="mb-6 flex items-center justify-between">
          <Tabs defaultValue="dashboard" className="w-auto">
            <TabsList>
              <TabsTrigger
                value="dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : ''}
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                onClick={() => setActiveTab('settings')}
                className={activeTab === 'settings' ? 'bg-primary text-primary-foreground' : ''}
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="help"
                onClick={() => setActiveTab('help')}
                className={activeTab === 'help' ? 'bg-primary text-primary-foreground' : ''}
              >
                Help
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === 'dashboard' && (
            <Button
              onClick={() => setIsAddComponentOpen(!isAddComponentOpen)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Component
            </Button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {activeTab === 'dashboard' && (
            <div>
              {showWelcomeGuide && (
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>{steps[currentStep].title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{steps[currentStep].description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowWelcomeGuide(false)}>Skip Tour</Button>
                    <Button onClick={nextStep}>
                      {currentStep < steps.length - 1 ? 'Next Step' : 'Get Started'}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {isAddComponentOpen && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Choose a Component</CardTitle>
                    <CardDescription>Select the type of visualization you want to add</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {componentTypes.map((comp) => (
                        <Card
                          key={comp.type}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => addComponent(comp.type)}
                        >
                          <CardContent className="flex flex-col items-center justify-center p-6">
                            {comp.icon}
                            <h3 className="mt-2 font-medium">{comp.title}</h3>
                            <p className="text-xs text-muted-foreground text-center mt-1">{comp.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-4 gap-6">
                {dashboardComponents.map((component : any) => (
                  <Card
                    key={component.id}
                    className={`${getComponentSizeClass(component.size)} border border-border hover:shadow-md transition-all duration-200 relative ${getComponentHeightClass(component.size)}`}
                  >
                    <div className="absolute top-3 right-3 flex space-x-1 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted">
                        <Settings className="h-4 w-4" />
                      </Button>
                      
                      {/* Size dropdown menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => updateComponentSize(component.id, 'sm')}
                            className={component.size === 'sm' ? 'bg-accent' : ''}
                          >
                            Small
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateComponentSize(component.id, 'md')}
                            className={component.size === 'md' ? 'bg-accent' : ''}
                          >
                            Medium
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateComponentSize(component.id, 'lg')}
                            className={component.size === 'lg' ? 'bg-accent' : ''}
                          >
                            Large
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateComponentSize(component.id, 'xl')}
                            className={component.size === 'xl' ? 'bg-accent' : ''}
                          >
                            Extra Large
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeComponent(component.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-md bg-muted flex items-center justify-center">
                          {renderComponentIcon(component.type)}
                        </div>
                        <CardTitle className="ml-2 text-lg font-medium">{component.title}</CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex items-center justify-center bg-muted/50 rounded-md">
                      <p className="text-muted-foreground text-sm">Component Preview</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {dashboardComponents.length === 0 && (
                <div className="text-center py-12 bg-muted/50 rounded-lg border border-border">
                  <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your dashboard is empty</h3>
                  <p className="text-muted-foreground">Click "Add Component" to get started</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddComponentOpen(true)}
                  >
                    Add Your First Component
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Configure your dashboard appearance and data sources</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings content would go here...</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'help' && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Help</CardTitle>
                <CardDescription>Learn how to create an effective dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilder;