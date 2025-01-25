import { JobFilters } from "@/types/filters";
import { ReadonlyURLSearchParams } from "next/navigation";

export function parseUrlFilters(searchParams: ReadonlyURLSearchParams): JobFilters {
  return {
    search: searchParams.get("search") || "",
    studyFields: searchParams.getAll("studyFields"),
    jobTypes: searchParams.getAll("jobTypes"),
    locations: searchParams.getAll("locations"),
    workingRights: searchParams.getAll("workingRights"),
    page: Number(searchParams.get("page")) || 1,
    sortBy: (searchParams.get("sortBy") as "recent" | "relevant") || "recent",
  };
}
