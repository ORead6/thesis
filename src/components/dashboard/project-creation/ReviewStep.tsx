import React from 'react';
import ICONS from '@/components/dashboard/availableIcons';
import CreationStatusIndicator from './CreationStatusIndicator';
import { ReviewStepProps } from '@/types/project-types';

const ReviewStep: React.FC<ReviewStepProps> = ({
  projectData,
  isCreating,
  creationStatus,
  creationSuccess
}) => {
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <CreationStatusIndicator 
          isCreating={isCreating} 
          creationSuccess={creationSuccess} 
          creationStatus={creationStatus} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <h3 className="font-semibold text-xl">Review Project Details</h3>
      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          {ICONS.find(icon => icon.id === projectData.icon)?.icon}
          <div>
            <p className="font-bold text-lg">{projectData.title}</p>
            <p className="text-sm text-muted-foreground">{projectData.description}</p>
          </div>
        </div>
        {projectData.csvFile && (
          <div className="text-sm mt-3">
            <span className="font-medium">Data file:</span> {projectData.csvFile.name}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <p className="font-medium mb-2">Data Context:</p>
          <div className="text-sm bg-background p-3 rounded-md max-h-[120px] overflow-y-auto">
            {projectData.dataContext}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;