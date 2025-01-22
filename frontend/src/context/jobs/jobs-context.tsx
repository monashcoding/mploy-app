// frontend/src/context/jobs/jobs-context.tsx
import { createContext, useContext } from "react";
import { Job } from "@/types/job";
import { JobFilters } from "@/types/filters";

interface JobsState {
  jobs: Job[];
  selectedJobId: string | null;
  filters: JobFilters;
  totalJobs: number;
  isLoading: boolean;
  error: Error | null;
}

interface JobsContextType {
  state: JobsState;
  setSelectedJob: (jobId: string | null) => void;
  updateFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
}

export const initialFilters: JobFilters = {
  search: "",
  studyFields: [],
  jobTypes: [],
  locations: [],
  workingRights: [],
  page: 1,
  sortBy: "recent",
};

export const initialState: JobsState = {
  jobs: [],
  selectedJobId: null,
  filters: initialFilters,
  totalJobs: 0,
  isLoading: false,
  error: null,
};

export const JobsContext = createContext<JobsContextType | undefined>(
  undefined,
);

export function useJobsContext() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobsContext must be used within JobsProvider");
  }
  return context;
}
