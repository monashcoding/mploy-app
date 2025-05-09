// frontend/src/types/filters.ts
import { JobType, LocationType, WorkingRight, IndustryField } from "./job";

/**
 * JobFilters is a type that represents the filters that can be applied to the job search
 */
export interface JobFilters {
  search: string;
  jobTypes: JobType[];
  locations: LocationType[];
  workingRights: WorkingRight[];
  industryFields: IndustryField[];
  page: number;
  sortBy: SortBy;
}

export enum SortBy {
  RECENT_DESC = "recent_desc",
  RECENT_ASC = "recent_asc",
  CLOSING_DESC = "closing_desc",
  CLOSING_ASC = "closing_asc",
}

export interface FilterState {
  filters: JobFilters;
  isLoading: boolean;
  error: Error | null;
}
