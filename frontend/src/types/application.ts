export const APPLICATION_STATUSES = [
  "STARTED",
  "APPLIED",
  "REJECTED",
  "ACCEPTED",
  "INTERVIEW",
  "OFFER",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationJobSnapshot = {
  jobId: string;
  title: string;
  companyName: string;
  applicationUrl?: string;
};

export type LocalApplication = {
  jobId: string;
  status: ApplicationStatus;
  startedAt: string;
  updatedAt: string;
  jobSnapshot: ApplicationJobSnapshot;
};

export type DbApplication = LocalApplication & {
  _id: string;
};

