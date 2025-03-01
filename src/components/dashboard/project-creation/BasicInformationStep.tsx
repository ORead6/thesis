import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StepProps } from '@/types/project-types';

const BasicInformationStep: React.FC<StepProps> = ({ projectData, updateData }) => {
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