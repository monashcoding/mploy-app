"use client";

// frontend/src/context/jobs/filter-context.tsx
import { createContext, useContext } from "react";
import { FilterState } from "@/types/filters";
import { Job } from "@/types/job";

interface FilterContextType {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  totalJobs: number;
  setTotalJobs: (totalJobs: number) => void;
  isLoading: boolean;
  clearFilters: () => void;
}

export const FilterContext = createContext<FilterContextType | undefined>(
  undefined,
);

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useJobsContext must be used within JobsProvider");
  }
  return context;
}
