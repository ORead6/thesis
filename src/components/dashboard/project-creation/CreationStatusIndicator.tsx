import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface CreationStatusIndicatorProps {
  isCreating: boolean;
  creationSuccess: boolean;
  creationStatus: string;
}

const CreationStatusIndicator: React.FC<CreationStatusIndicatorProps> = ({
  isCreating,
  creationSuccess,
  creationStatus
}) => {
  if (creationSuccess) {
    return (
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold text-xl">Project Created Successfully!</h3>
        <p className="text-muted-foreground">Redirecting to your new project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h3 className="font-semibold text-xl">Creating Your Project</h3>
      <p className="text-muted-foreground">{creationStatus}</p>
    </div>
  );
};

export default CreationStatusIndicator;