// frontend/src/hooks/use-pagination.ts
import { useCallback } from "react";
import { useJobsContext } from "@/context/jobs/jobs-context";

export function usePagination() {
  const { state, updateFilters } = useJobsContext();
  const { page } = state.filters;
  const totalPages = Math.ceil(state.totalJobs / 10);

  const setPage = useCallback(
    (newPage: number) => {
      updateFilters({ page: newPage });
    },
    [updateFilters],
  );

  return {
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage(page + 1),
    prevPage: () => setPage(page - 1),
    setPage,
  };
}
