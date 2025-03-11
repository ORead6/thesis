import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StepProps } from '@/types/project-types';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const BasicInformationStep: React.FC<StepProps> = ({ projectData, updateData }) => {
  const sports = [
    "Handball",
    "Basketball",
    "American Football",
    "Football",
    "Tennis",
    "Golf",
    "Baseball",
    "Hockey",
    "Cricket",
    "Rugby",
    "Volleyball"
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="font-medium">
          Project Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={projectData.title}
          onChange={(e) => updateData("title", e.target.value)}
          placeholder="Enter project title"
          className="shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sport" className="font-medium">
          Sport <span className="text-red-500">*</span>
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {projectData.sport || "Select a sport"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col w-[30vw]" align="start"
            side="bottom" >
            {sports.map((sport) => (
              <DropdownMenuItem
                key={sport}
                onClick={() => updateData("sport", sport)}
                className="flex items-center justify-between"
              >
                {sport}
                {projectData.sport === sport && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-muted-foreground">Select the sport you are analyzing</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Project Description
        </Label>
        <Textarea
          id="description"
          value={projectData.description}
          onChange={(e) => updateData("description", e.target.value)}
          placeholder="Enter a short description of this project"
          rows={3}
          className="shadow-sm focus:ring-primary focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">A brief description for the dashboard</p>
      </div>
    </div>
  );
};

export default BasicInformationStep;