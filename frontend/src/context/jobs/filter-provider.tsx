// frontend/src/context/jobs/jobs-provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { FilterContext, FilterState, initialState } from "./filter-context";
import { useRouter } from "next/navigation";
import { CreateQueryString } from "@/lib/utils";

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initialState);
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
