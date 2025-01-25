// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { JobsContext, initialState } from "./jobs-context";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";
import { MOCK_JOBS } from "@/lib/mock-data";
import { useRouter, useSearchParams } from "next/navigation";
import { filterJobs } from "@/lib/filter-jobs";

type JobsAction =
  | { type: "SET_JOBS"; payload: { jobs: Job[]; total: number } }
  | { type: "SET_SELECTED_JOB"; payload: string | null }
  | { type: "UPDATE_FILTERS"; payload: Partial<JobFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null };

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
      return { ...state, selectedJobId: action.payload };
    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          page: action.payload.page ?? 1,
        },
      };
    case "CLEAR_FILTERS":
      return { ...state, filters: initialState.filters };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobsReducer, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  const setSelectedJob = useCallback((jobId: string | null) => {
    dispatch({ type: "SET_SELECTED_JOB", payload: jobId });
  }, []);

  const updateFilters = useCallback((filters: Partial<JobFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
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

    router.push(`?${params.toString()}`);
    dispatch({ type: "UPDATE_FILTERS", payload: filters });
  }, [router, searchParams]);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  // Initialize state from URL on mount
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

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const filtered = filterJobs(MOCK_JOBS, state.filters);
    dispatch({
      type: "SET_JOBS",
      payload: { jobs: filtered, total: filtered.length },
    });
  }, [state.filters]);

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
