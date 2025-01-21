"use client";

import { createContext, useContext } from "react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  studyFields: string[];
  workingRights: string[];
  description: string;
  postedDate: string;
}

export interface JobFilters {
  search: string;
  studyFields: string[];
  jobTypes: string[];
  locations: string[];
  workingRights: string[];
  page: number;
  sortBy: "recent" | "relevant";
}

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

const initialFilters: JobFilters = {
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
  if (context === undefined) {
    throw new Error("useJobsContext must be used within a JobsProvider");
  }
  return context;
}
