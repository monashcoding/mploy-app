// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterContext } from "./filter-context";
import { CreateQueryString } from "@/lib/utils";
import { FilterState } from "@/types/filters";
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
    excludedCompanies: [],
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
      // Company names are dynamic (not a fixed enum), so we only trim + dedupe.
      excludedCompanies: [
        ...new Set(
          searchParams
            .getAll("excludedCompanies[]")
            .map((name) => name.trim())
            .filter((name) => name.length > 0),
        ),
      ],
      page: Number(searchParams.get("page")) || 1,
    },
    isLoading: false,
    error: null,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [selectedJob, setSelectedJobInternal] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  const setSelectedJob = (job: Job | null) => {
    if (job?.working_rights && job.working_rights.length > 0) {
      job.working_rights = [...new Set(job.working_rights)];
    }
    setSelectedJobInternal(job);
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setIsLoading(true);
    setFilters((curr) => ({ ...curr, ...newFilters }));
    setSelectedJob(null);
    const params = CreateQueryString(newFilters);
    router.push(`/jobs?${params}`);
  };

  const searchParamsKey = searchParams.toString();
  const navKey = `${pathname}|${searchParamsKey}`;
  const [prevNavKey, setPrevNavKey] = useState(navKey);

  if (prevNavKey !== navKey) {
    setPrevNavKey(navKey);

    if (pathname === "/jobs") {
      setIsLoading(false);
      setSelectedJobInternal(null);
    }

    if (pathname === "/") {
      setFilters(emptyFilterState);
    }
  }

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
