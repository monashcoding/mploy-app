// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { FilterContext } from "./filter-context";
import { useRouter } from "next/navigation";
import { CreateQueryString } from "@/lib/utils";
import { FilterState, SortBy } from "@/types/filters";

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
  const router = useRouter();

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((curr) => ({ ...curr, ...newFilters }));
    const params = CreateQueryString(newFilters);
    router.push(`/jobs?${params}`);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
}
