// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import { JobsContext, initialState } from "./jobs-context";
import { JobFilters } from "@/types/filters";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types/job";

export function JobsProvider({
  children,
  initialFilters,
  initialJobs = [],
}: {
  children: ReactNode;
  initialFilters?: JobFilters;
  initialJobs?: Job[];
}) {
  const [state, setState] = useState({
    ...initialState,
    filters: initialFilters || initialState.filters,
    jobs: initialJobs,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handles selection of a specific job
  const setSelectedJob = useCallback((jobId: string | null) => {
    setState((prev) => ({ ...prev, selectedJobId: jobId }));
  }, []);

  // Updates filters and syncs with URL
  const updateFilters = useCallback(
    (filters: Partial<JobFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Handle different filter types (arrays, strings, etc)
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      // Update URL and state
      router.push(`?${params.toString()}`);
      setState((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          ...filters,
          page: filters.page ?? 1,
        },
      }));
    },
    [router, searchParams],
  );

  // Resets all filters to initial state
  const clearFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: initialState.filters }));
  }, []);


  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      state,
      setSelectedJob,
      updateFilters,
      clearFilters,
    }),
    [state, setSelectedJob, updateFilters, clearFilters],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}
