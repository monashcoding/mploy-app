// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { JobsContext, initialState } from "./jobs-context";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";
import { useRouter, useSearchParams } from "next/navigation";

// Define possible actions for the reducer
type JobsAction =
  | { type: "SET_JOBS"; payload: { jobs: Job[]; total: number } }
  | { type: "SET_SELECTED_JOB"; payload: string | null }
  | { type: "UPDATE_FILTERS"; payload: Partial<JobFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null };

// Simplified reducer with descriptive comments
function jobsReducer(state: typeof initialState, action: JobsAction) {
  switch (action.type) {
    case "SET_JOBS":
      return {
        ...state,
        jobs: action.payload.jobs,
        totalJobs: action.payload.total,
        isLoading: false,
        error: null,
      };

    case "SET_SELECTED_JOB":
      return { 
        ...state, 
        selectedJobId: action.payload 
      };

    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          page: action.payload.page ?? 1, // Default to page 1 if not specified
        },
      };

    case "CLEAR_FILTERS":
      return { 
        ...state, 
        filters: initialState.filters 
      };

    case "SET_LOADING":
      return { 
        ...state, 
        isLoading: action.payload 
      };

    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload, 
        isLoading: false 
      };

    default:
      return state;
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobsReducer, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handles selection of a specific job
  const setSelectedJob = useCallback((jobId: string | null) => {
    dispatch({ type: "SET_SELECTED_JOB", payload: jobId });
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
    dispatch({ type: "UPDATE_FILTERS", payload: filters });
  }, [router, searchParams]);

  // Resets all filters to initial state
  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
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
    
    dispatch({ type: "UPDATE_FILTERS", payload: urlFilters });
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
