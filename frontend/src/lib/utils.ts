import { FilterState } from "@/types/filters";
import { Job } from "@/types/job";
import { MongoJob } from "@/app/jobs/actions";

export function CreateQueryString(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value.toString());
    }
  }

  return params.toString();
}

type MongoDate = Date | string | null | undefined;

function serializeDate(date: MongoDate): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  return new Date(date).toISOString();
}

export default function serializeJob(job: MongoJob): Job {
  return {
    id: job._id.toString(),
    title: job.title,
    company: job.company,
    sourceUrls: job.sourceUrls,
    locations: job.locations,
    studyFields: job.studyFields,
    industryField: job.industryField,
    workingRights: job.workingRights,
    createdAt: serializeDate(job.createdAt),
    updatedAt: serializeDate(job.updatedAt),
    type: job.type,
    description: job.description,
    applicationUrl: job.applicationUrl,
    closeDate: serializeDate(job.closeDate),
  };
}
