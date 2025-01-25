"use client";

// frontend/src/context/jobs/filter-context.tsx
import { createContext, useContext } from "react";
import { JobFilters } from "@/types/filters";

export interface FilterState {
  filters: JobFilters;
  totalJobs: number;
  isLoading: boolean;
  error: Error | null;
}

interface FilterContextType {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
}

export const initialState: FilterState = {
  filters: {
    search: "",
    industry: [],
    jobTypes: [],
    locations: [],
    workingRights: [],
    page: 1,
    sortBy: "recent",
  },
  totalJobs: 0,
  isLoading: false,
  error: null,
};

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
