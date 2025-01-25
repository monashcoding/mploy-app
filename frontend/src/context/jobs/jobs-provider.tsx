// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { JobsContext, initialState } from "./jobs-context";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";
import { useRouter, useSearchParams } from "next/navigation";

export function JobsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handles selection of a specific job
  const setSelectedJob = useCallback((jobId: string | null) => {
    setState(prev => ({ ...prev, selectedJobId: jobId }));
  }, []);

  // Updates filters and syncs with URL
  const updateFilters = useCallback((filters: Partial<JobFilters>) => {
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
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
        page: filters.page ?? 1
      }
    }));
  }, [router, searchParams]);

  // Resets all filters to initial state
  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: initialState.filters }));
  }, []);

  // Initialize state from URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlFilters = {
      search: params.get("search") || "",
      studyFields: params.getAll("studyFields"),
      jobTypes: params.getAll("jobTypes"),
      locations: params.getAll("locations"),
      workingRights: params.getAll("workingRights"),
      page: Number(params.get("page")) || 1,
      sortBy: (params.get("sortBy") as "recent" | "relevant") || "recent",
    };
    
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...urlFilters
      }
    }));
  }, [searchParams]);

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

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}
