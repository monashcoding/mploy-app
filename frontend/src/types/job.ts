// frontend/src/types/job.ts
export type JobType = "EOI" | "FIRST_YEAR" | "INTERN" | "GRADUATE";
export type StudyField = "SOFTWARE" | "CYBERSECURITY" | "DATA_SCIENCE";
export type LocationType = "VIC" | "NSW" | "QLD" | "WA" | "NT" | "SA" | "HYBRID" | "REMOTE" | "AUSTRALIA";
export type WorkingRight = "AUS_CITIZEN" | "AUS_PR" | "NZ_CITIZEN" | "NZ_PR" | "INTERNATIONAL";

export interface Company {
  name: string;
  website: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: Company;
  applicationUrl: string;
  sourceUrls: string[];
  type: JobType;
  closeDate?: string;
  locations: LocationType[];
  studyFields: StudyField[];
  startDate: string;
  workingRights: WorkingRight[];
  createdAt: string;
  updatedAt: string;
}
