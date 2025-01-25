// frontend/src/types/job.ts
export type JobType = "EOI" | "FIRST_YEAR" | "INTERN" | "GRADUATE" | "OTHER";
export type LocationType = "VIC" | "NSW" | "QLD" | "WA" | "NT" | "SA" | "ACT" | "TAS" | "AUSTRALIA" | "OTHERS";
export type WFHStatus = "HYBRID" | "REMOTE" | "OFFICE";
export type WorkingRight = "AUS_CITIZEN" | "AUS_PR" | "NZ_CITIZEN" | "NZ_PR" | "INTERNATIONAL" | "WORK_VISA" | "VISA_SPONSORED" | "OTHER_RIGHTS";
export type IndustryField = "CONSULTING" | "BANKS" | "BIG_TECH" | "TECH" | "QUANT_TRADING" | "OTHER_INDUSTRY";

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
  applicationUrl?: string;
  wfhStatus?: WFHStatus;
  sourceUrls: string[];
  type?: JobType;
  openDate?: string;
  closeDate?: string;
  locations: LocationType[];
  studyFields: string[];
  industryField: IndustryField;
  workingRights: WorkingRight[];
  createdAt: string;
  updatedAt: string;
}
