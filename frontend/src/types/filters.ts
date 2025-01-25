// frontend/src/types/filters.ts

type StudyField = "Computer Science" | "Software Engineering" | "Information Technology" | "Business" | "Engineering";
type JobType = "Full-time" | "Part-time" | "Internship" | "Graduate Program";
type WorkingRight = "Australian Citizen" | "Permanent Resident" | "Student Visa" | "Working Holiday";

/**
 * JobFilters is a type that represents the filters that can be applied to the job search
 */
export interface JobFilters {
  search: string;
  studyFields: StudyField[];
  jobTypes: JobType[];
  locations: string[];
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
  "Computer Science",
  "Software Engineering", 
  "Information Technology",
  "Business",
  "Engineering",
] as const;

export const JOB_TYPES: readonly JobType[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Graduate Program",
] as const;

export const WORKING_RIGHTS: readonly WorkingRight[] = [
  "Australian Citizen",
  "Permanent Resident",
  "Student Visa",
  "Working Holiday",
] as const;
