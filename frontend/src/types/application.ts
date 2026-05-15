export const APPLICATION_STATUSES = [
  "STARTED",
  "APPLIED",
  "ACCEPTED",
  "REJECTED",
  "INTERVIEW",
] as const;

export type DefaultApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Stage name slug (UPPER_SNAKE_CASE). Stored on the application document.
export type ApplicationStatus = string;

export type StageColorRole = "neutral" | "active" | "win" | "loss";

export type UserStage = {
  id: string;
  name: string;
  displayName: string;
  order: number;
  colorRole: StageColorRole;
  isDefault: boolean;
};

export const DEFAULT_RECRUITMENT_CYCLE_ID = "current";

export type RecruitmentCycle = {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationJobSnapshot = {
  jobId: string;
  title: string;
  companyName: string;
  applicationUrl?: string;
  logo?: string;
};

export type LocalApplication = {
  jobId: string;
  status: ApplicationStatus;
  startedAt: string;
  updatedAt: string;
  jobSnapshot: ApplicationJobSnapshot;
  cycleId?: string;
  notes?: string;
  starred?: boolean;
};

export type DbApplication = LocalApplication & {
  _id: string;
};
