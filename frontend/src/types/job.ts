// frontend/src/types/job.ts
export const JOB_TYPES = [
  "PRE_PENULTIMATE",
  "INTERN",
  "GRADUATE",
  "OTHER",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const LOCATIONS = [
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
export type LocationType = (typeof LOCATIONS)[number];

export const WORKING_RIGHTS = [
  "AUS_CITIZEN",
  "AUS_PR",
  "NZ_CITIZEN",
  "NZ_PR",
  "INTERNATIONAL",
  "WORK_VISA",
  "VISA_SPONSORED",
  "OTHER_RIGHTS",
] as const;
export type WorkingRight = (typeof WORKING_RIGHTS)[number];

export const INDUSTRY_FIELDS = [
  "CONSULTING",
  "BANKS",
  "BIG_TECH",
  "TECH",
  "QUANT_TRADING",
  "OTHER_INDUSTRY",
] as const;
export type IndustryField = (typeof INDUSTRY_FIELDS)[number];

export interface Company {
  name: string;
  website?: string;
  logo?: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  company: Company;
  application_url?: string;
  source_urls: string[];
  type?: JobType;
  close_date?: string;
  locations: LocationType[];
  industry_field?: IndustryField;
  working_rights: WorkingRight[];
  created_at: string;
  updated_at: string;
}
