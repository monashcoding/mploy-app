// frontend/src/types/filters.ts
export interface JobFilters {
  search: string;
  industry: string[];
  jobTypes: string[];
  locations: string[];
  workingRights: string[];
  page: number;
  sortBy: "recent" | "relevant";
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
