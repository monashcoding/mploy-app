"use client";

import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { JobsContext, initialState, JobFilters, Job } from "./jobs-context";

type JobsAction =
  | { type: "SET_JOBS"; payload: { jobs: Job[]; total: number } }
  | { type: "SET_SELECTED_JOB"; payload: string | null }
  | { type: "UPDATE_FILTERS"; payload: Partial<JobFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null };

function jobsReducer(
  state: typeof initialState,
  action: JobsAction,
): typeof initialState {
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
        selectedJobId: action.payload,
      };

    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          // Reset page to 1 when filters change, unless page is being explicitly set
          page: action.payload.page ?? 1,
        },
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: initialState.filters,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jobsReducer, initialState);

  const setSelectedJob = useCallback((jobId: string | null) => {
    dispatch({ type: "SET_SELECTED_JOB", payload: jobId });
  }, []);

  const updateFilters = useCallback((filters: Partial<JobFilters>) => {
    dispatch({ type: "UPDATE_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  // Fetch jobs whenever filters change
  useEffect(() => {
    async function fetchJobs() {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const params = new URLSearchParams();
        Object.entries(state.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else if (value) {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch jobs");

        const data = await response.json();
        dispatch({
          type: "SET_JOBS",
          payload: { jobs: data.jobs, total: data.total },
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    }

    fetchJobs();
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
