// frontend/src/types/filters.ts

/**
 * JobFilters is a type that represents the filters that can be applied to the job search
 */
export interface JobFilters {
  search: string;
  studyFields: string[];
  jobTypes: string[];
  locations: string[];
  workingRights: string[];
  page: number;
  sortBy: 0 | 1; // recent = 0, relevant = 1
}

// These are commonly used filter options that will be used across components
export const STUDY_FIELDS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Business",
  "Engineering",
];

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Graduate Program",
];

export const WORKING_RIGHTS = [
  "Australian Citizen",
  "Permanent Resident",
  "Student Visa",
  "Working Holiday",
];
