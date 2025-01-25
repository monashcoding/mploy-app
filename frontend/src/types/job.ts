// frontend/src/types/job.ts
export interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    website: string;
  };
  description: string;
  type: string;
  locations: string[];
  studyFields: string[];
  workingRights: string[];
  applicationUrl: string;
  closeDate: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}
