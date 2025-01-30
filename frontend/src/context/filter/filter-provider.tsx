// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { FilterContext } from "./filter-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateQueryString } from "@/lib/utils";
import { FilterState, SortBy } from "@/types/filters";
import { Job } from "@/types/job";

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
  const [filters, setFilters] = useState<FilterState>(emptyFilterState);
  const [selectedJob, setSelectedJobInternal] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setIsLoading(true);
    setFilters((curr) => ({ ...curr, ...newFilters }));
    setSelectedJob(null);
    const params = CreateQueryString(newFilters);
    console.log(params);
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
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
