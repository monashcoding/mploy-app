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
  // Company names to hide from results (exclusion-based filter).
  // Empty = show all companies.
  excludedCompanies: string[];
  page: number;
}

export interface FilterState {
  filters: JobFilters;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A single company facet: the company name and how many listings match the
 * currently applied filters (excluding the company exclusion itself).
 */
export interface CompanyFacet {
  company: string;
  count: number;
}
