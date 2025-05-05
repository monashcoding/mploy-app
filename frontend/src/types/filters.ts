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
  RECENT_DESC = "recentdesc",
  RECENT_ASC = "recentasc",
  CLOSING_DESC = "closingdesc",
  CLOSING_ASC = "closingasc",
}

export interface FilterState {
  filters: JobFilters;
  isLoading: boolean;
  error: Error | null;
}
