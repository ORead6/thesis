export interface Project {
  id: string;
  title: string;
  description: string | null;
  icon?: string;
  isFavourite: boolean;
  dataFilePath?: string;
  createdAt: string;
  owner: string;
  metadata?: Record<string, any>;
}