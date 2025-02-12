// frontend/src/types/filters.ts
import { JobType, LocationType, WorkingRight, IndustryField } from "./job";

/**
 * JobFilters is a type that represents the filters that can be applied to the job search
 */
export interface JobFilters {
  search: string;
  jobTypes: Set<JobType>;
  locations: Set<LocationType>;
  workingRights: Set<WorkingRight>;
  industryFields: Set<IndustryField>;
  page: number;
  sortBy: SortBy;
}

export enum SortBy {
  RECENT = "recent",
  RELEVANT = "relevant",
}

export interface FilterState {
  filters: JobFilters;
  isLoading: boolean;
  error: Error | null;
}
