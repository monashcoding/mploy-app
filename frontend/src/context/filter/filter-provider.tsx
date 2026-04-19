// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useEffect, useState, useTransition } from "react";
import { FilterContext } from "./filter-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateQueryString } from "@/lib/utils";
import { FilterState, ViewMode } from "@/types/filters";
import { transitionState } from "@/lib/transition-state";
import {
  Job,
  IndustryField,
  INDUSTRY_FIELDS,
  JobType,
  JOB_TYPES,
  LocationType,
  LOCATIONS,
  WorkingRight,
  WORKING_RIGHTS,
} from "@/types/job";

const emptyFilterState: FilterState = {
  filters: {
    search: "",
    industryFields: [],
    jobTypes: [],
    locations: [],
    workingRights: [],
    page: 1,
  },
  isLoading: false,
  error: null,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilterState: FilterState = {
    filters: {
      search: searchParams.get("search") || "",
      industryFields:
        searchParams
          .getAll("industryFields[]")
          .filter((field): field is IndustryField =>
            INDUSTRY_FIELDS.includes(field as IndustryField),
          ) || [],
      jobTypes:
        searchParams
          .getAll("jobTypes[]")
          .filter((field): field is JobType =>
            JOB_TYPES.includes(field as JobType),
          ) || [],
      locations:
        searchParams
          .getAll("locations[]")
          .filter((field): field is LocationType =>
            LOCATIONS.includes(field as LocationType),
          ) || [],
      workingRights:
        searchParams
          .getAll("workingRights[]")
          .filter((field): field is WorkingRight =>
            WORKING_RIGHTS.includes(field as WorkingRight),
          ) || [],
      page: Number(searchParams.get("page")) || 1,
    },
    isLoading: false,
    error: null,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [selectedJob, setSelectedJobInternal] = useState<Job | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  const isLoading = isPending || isNavigating;

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setIsNavigating(true);
    setFilters((curr) => ({ ...curr, ...newFilters }));
    setSelectedJob(null);

    // Trigger dot background wave while loading
    transitionState.active = true;
    transitionState.direction = 1;
    transitionState.startTime = performance.now();

    const params = CreateQueryString(newFilters);
    startTransition(() => {
      router.push(`/jobs?${params}`);
    });
  };

  useEffect(() => {
    if (pathname === "/jobs") {
      setIsNavigating(false);
      setSelectedJob(null);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // clear filters on return to homepage
    if (pathname === "/") {
      setFilters(emptyFilterState);
    }
  }, [pathname]);

  // Wrapper for SelectedJob to validate attributes first
  const setSelectedJob = (job: Job | null) => {
    // Remove duplicates from working_rights
    if (job?.working_rights && job.working_rights.length > 0) {
      job.working_rights = [...new Set(job.working_rights)];
    }
    setSelectedJobInternal(job);
  };

  const clearFilters = () => {
    setIsNavigating(true);
    setFilters(emptyFilterState);
    setSelectedJob(null);

    transitionState.active = true;
    transitionState.direction = -1;
    transitionState.startTime = performance.now();

    startTransition(() => {
      router.push("/jobs");
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        selectedJob,
        isLoading,
        totalJobs,
        setTotalJobs,
        updateFilters,
        setSelectedJob,
        clearFilters,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
