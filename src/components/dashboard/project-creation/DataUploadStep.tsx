import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepProps } from '@/types/project-types';

const DataUploadStep: React.FC<StepProps> = ({ projectData, updateData }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData("csvFile", e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="data-context" className="font-medium">
          Data Context <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="data-context"
          value={projectData.dataContext}
          onChange={(e) => updateData("dataContext", e.target.value)}
          placeholder="Describe what this data represents, important columns, and any context that would help understand the dataset"
          rows={3}
          className="shadow-sm focus:ring-primary focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">
          This information is crucial for generating accurate and relevant KPIs from your data.
        </p>
      </div>

      <Label htmlFor="csv-upload" className="font-medium block mt-4">
        Upload project data (CSV) <span className="text-red-500">*</span>
      </Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          "hover:border-primary",
          projectData.csvFile ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const files = e.dataTransfer.files;
          if (files.length > 0) {
            const file = files[0];
            if (file.type === "text/csv" || file.name.endsWith('.csv')) {
              updateData("csvFile", file);
            }
          }
        }}
      >
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Label htmlFor="csv-upload" className="cursor-pointer block w-full h-full">
          <div className="flex flex-col items-center">
            <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="font-medium">
              {projectData.csvFile ? "File selected" : "Drop CSV here or click to upload"}
            </span>
            <span className="text-sm text-muted-foreground">
              {projectData.csvFile ? projectData.csvFile.name : "CSV files only (required)"}
            </span>
          </div>
        </Label>
      </div>
    </div>
  );
};

export default DataUploadStep;