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

// frontend/src/types/filters.ts
export interface JobFilters {
  search: string;
  studyFields: string[];
  jobTypes: string[];
  locations: string[];
  workingRights: string[];
  page: number;
  sortBy: "recent" | "relevant";
}

// frontend/src/types/api.ts
export interface JobsResponse {
  jobs: Job[];
  total: number;
}

export interface ApiError {
  message: string;
  code: string;
}
