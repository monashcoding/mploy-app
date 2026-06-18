import { LocalApplication } from "@/types/application";
import { Job } from "@/types/job";

const STORAGE_KEY = "mploy_applications_v1";

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getLocalApplications(): LocalApplication[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed as LocalApplication[];
}

export function setLocalApplications(apps: LocalApplication[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function upsertLocalStartedApplication(job: Job): LocalApplication {
  const now = new Date().toISOString();
  const apps = getLocalApplications();
  const existing = apps.find((a) => a.jobId === job.id);

  const next: LocalApplication = {
    jobId: job.id,
    status: existing?.status || "STARTED",
    startedAt: existing?.startedAt || now,
    updatedAt: now,
    jobSnapshot: {
      jobId: job.id,
      title: job.title,
      companyName: job.company?.name || "Unknown",
      applicationUrl: job.application_url,
      logo: job.company?.logo,
    },
  };

  const merged = [next, ...apps.filter((a) => a.jobId !== job.id)];
  setLocalApplications(merged);
  return next;
}

export function clearLocalApplications() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
