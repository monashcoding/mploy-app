"use client";

// frontend/src/context/jobs/filter-context.tsx
import { createContext, useContext } from "react";
import { FilterState } from "@/types/filters";

interface FilterContextType {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
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
