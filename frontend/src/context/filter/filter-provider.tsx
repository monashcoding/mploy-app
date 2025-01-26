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
  totalJobs: 0,
  isLoading: false,
  error: null,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(emptyFilterState);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <FilterContext.Provider
      value={{
        filters,
        selectedJob,
        isLoading,
        updateFilters,
        setSelectedJob,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
