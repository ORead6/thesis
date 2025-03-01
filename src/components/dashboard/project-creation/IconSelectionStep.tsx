import React from 'react';
import { Label } from '@/components/ui/label';
import ICONS from '@/components/dashboard/availableIcons';
import IconSelector from './IconSelector';
import { StepProps } from '@/types/project-types';

const IconSelectionStep: React.FC<StepProps> = ({ projectData, updateData }) => {
  return (
    <div className="space-y-6 py-4">
      <Label className="font-medium">Select a project icon</Label>

      {/* Icon selector component */}
      <IconSelector 
        selectedIcon={projectData.icon} 
        onIconChange={(iconId) => updateData("icon", iconId)} 
      />

      {/* Selected icon preview */}
      <div className="mt-6">
        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview</Label>
        <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg">
          <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center">
            {ICONS.find(icon => icon.id === projectData.icon)?.icon}
          </div>
          <div>
            <p className="font-medium">{projectData.title || "Project Title"}</p>
            <p className="text-xs text-muted-foreground">with {projectData.icon} icon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconSelectionStep;