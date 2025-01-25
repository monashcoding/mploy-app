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
  RECENT = "recent",
  RELEVANT = "relevant",
}

// These are commonly used filter options that will be used across components
export const JOB_TYPES: readonly JobType[] = [
  "EOI",
  "FIRST_YEAR",
  "INTERN",
  "GRADUATE",
  "OTHER",
] as const;

export const WORKING_RIGHTS: readonly WorkingRight[] = [
  "AUS_CITIZEN",
  "AUS_PR",
  "NZ_CITIZEN",
  "NZ_PR",
  "INTERNATIONAL",
  "WORK_VISA",
  "VISA_SPONSORED",
  "OTHER_RIGHTS",
] as const;

export const LOCATIONS: readonly LocationType[] = [
  "VIC",
  "NSW",
  "QLD",
  "WA",
  "NT",
  "SA",
  "ACT",
  "TAS",
  "AUSTRALIA",
  "OTHERS",
] as const;

export const INDUSTRY_FIELDS: readonly IndustryField[] = [
  "CONSULTING",
  "BANKS",
  "BIG_TECH",
  "TECH",
  "QUANT_TRADING",
  "OTHER_INDUSTRY",
] as const;
