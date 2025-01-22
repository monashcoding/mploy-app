// frontend/src/hooks/use-url-state.ts
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JobFilters } from "@/types/filters";

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrlState = useCallback(
    (filters: Partial<JobFilters>) => {
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
    },
    [router, searchParams],
  );

  const getStateFromUrl = useCallback((): Partial<JobFilters> => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      search: params.get("search") || "",
      studyFields: params.getAll("studyFields"),
      jobTypes: params.getAll("jobTypes"),
      locations: params.getAll("locations"),
      workingRights: params.getAll("workingRights"),
      page: Number(params.get("page")) || 1,
      sortBy: (params.get("sortBy") as "recent" | "relevant") || "recent",
    };
  }, [searchParams]);

  return { updateUrlState, getStateFromUrl };
}
