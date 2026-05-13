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
  notes?: string;
};

export type DbApplication = LocalApplication & {
  _id: string;
};
