// frontend/src/types/filters.ts
import { JobType, StudyField, LocationType, WorkingRight } from "./job";

/**
 * JobFilters is a type that represents the filters that can be applied to the job search
 */
export interface JobFilters {
  search: string;
  studyFields: StudyField[];
  jobTypes: JobType[];
  locations: LocationType[];
  workingRights: WorkingRight[];
  page: number;
  sortBy: SortBy;
}

export enum SortBy {
  RECENT = "recent",
  RELEVANT = "relevant",
}

// These are commonly used filter options that will be used across components
export const STUDY_FIELDS: readonly StudyField[] = [
  "SOFTWARE",
  "CYBERSECURITY",
  "DATA_SCIENCE",
] as const;

export const JOB_TYPES: readonly JobType[] = [
  "EOI",
  "FIRST_YEAR",
  "INTERN",
  "GRADUATE",
] as const;

export const WORKING_RIGHTS: readonly WorkingRight[] = [
  "AUS_CITIZEN",
  "AUS_PR",
  "NZ_CITIZEN",
  "NZ_PR",
  "INTERNATIONAL",
] as const;

export const LOCATIONS: readonly LocationType[] = [
  "VIC",
  "NSW",
  "QLD",
  "WA",
  "NT",
  "SA",
  "HYBRID",
  "REMOTE",
  "AUSTRALIA",
] as const;
