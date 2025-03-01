import React from 'react';

interface ProjectCreationProgressProps {
  step: number;
}

const ProjectCreationProgress: React.FC<ProjectCreationProgressProps> = ({ step }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
              stepNumber === step
                ? "bg-primary text-primary-foreground border-primary-foreground"
                : stepNumber < step
                  ? "bg-primary/80 text-primary-foreground border-primary/30"
                  : "bg-muted text-foreground border-muted-foreground/50"
            }`}
          >
            {stepNumber}
          </div>
        ))}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProjectCreationProgress;