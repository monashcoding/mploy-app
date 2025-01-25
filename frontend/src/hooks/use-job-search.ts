// frontend/src/hooks/use-job-search.ts
import { useEffect, useState } from "react";
import { useJobsContext } from "@/context/jobs/jobs-context";

const DEBOUNCE_MS = 300;

export function useJobSearch() {
  const { state, updateFilters } = useJobsContext();
  const [searchValue, setSearchValue] = useState(state.filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchValue });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchValue, updateFilters]);

  return {
    searchValue,
    setSearchValue,
    debouncedSearch: state.filters.search,
  };
}
