// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { FilterContext } from "./filter-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateQueryString } from "@/lib/utils";
import { FilterState, SortBy } from "@/types/filters";
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
    sortBy: SortBy.RECENT,
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
      page: 1,
      sortBy: SortBy.RECENT,
    },
    isLoading: false,
    error: null,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [selectedJob, setSelectedJobInternal] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setIsLoading(true);
    setFilters((curr) => ({ ...curr, ...newFilters }));
    setSelectedJob(null);
    const params = CreateQueryString(newFilters);
    router.push(`/jobs?${params}`);
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Wrapper for SelectedJob to validate attributes first
  const setSelectedJob = (job: Job | null) => {
    // Remove duplicates from working_rights
    if (job?.working_rights && job.working_rights.length > 0) {
      job.working_rights = [...new Set(job.working_rights)];
    }
    setSelectedJobInternal(job);
  };

  const clearFilters = () => {
    setIsLoading(true);
    setFilters(emptyFilterState);
    setSelectedJob(null);
    router.push("/jobs");
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
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
