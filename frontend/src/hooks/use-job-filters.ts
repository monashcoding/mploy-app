// frontend/src/hooks/use-job-filters.ts
import { useJobsContext } from "@/context/jobs/jobs-context";
import { JobFilters } from "@/types/filters";
import { useCallback } from "react";
import { useUrlState } from "./use-url-state";

export function useJobFilters() {
  const { updateFilters, clearFilters } = useJobsContext();
  const { updateUrlState } = useUrlState();

  const handleFilterChange = useCallback(
    (filters: Partial<JobFilters>) => {
      updateFilters(filters);
      updateUrlState(filters);
    },
    [updateFilters, updateUrlState],
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    updateUrlState({});
  }, [clearFilters, updateUrlState]);

  return { handleFilterChange, handleClearFilters };
}
