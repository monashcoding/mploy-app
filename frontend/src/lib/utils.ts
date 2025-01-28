import { FilterState } from "@/types/filters";
import { Job } from "@/types/job";
import { MongoJob } from "@/app/jobs/actions";

/**
 * Creates a URL query string from a partial FilterState object.
 * Called when the user updates the filter state to generate the new
 * URL to navigate to.
 *
 * @param filters - Partial FilterState containing the filter parameters to convert
 * @returns A URL-encoded query string
 *
 */
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

/**
 * Internal helper function to safely serialize MongoDB dates to ISO strings
 *
 * @param date - Date value from MongoDB that could be a Date object, string, null, or undefined
 * @returns An ISO date string or empty string if the date is invalid/missing
 *
 * @internal This is a helper function used by serializeJob
 */
function serializeDate(date: MongoDate): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  return new Date(date).toISOString();
}

/**
 * Converts a MongoDB job document into the frontend Job type
 * Handles the conversion of MongoDB's _id to string id and ensures
 * all dates are properly serialized
 *
 * @param job - Raw job document from MongoDB
 * @returns A serialized Job object suitable for frontend use
 */
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
