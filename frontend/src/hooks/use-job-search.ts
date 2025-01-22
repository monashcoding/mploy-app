// frontend/src/hooks/use-job-search.ts
import { useEffect, useState } from "react";
import { useJobsContext } from "@/context/jobs/jobs-context";

const DEBOUNCE_MS = 300;

export function useJobSearch() {
  const { state, updateFilters } = useJobsContext();
  const [debouncedSearch, setDebouncedSearch] = useState(state.filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(state.filters.search);
      updateFilters({ search: state.filters.search });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.filters.search, updateFilters]);

  return { debouncedSearch };
}
