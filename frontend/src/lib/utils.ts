import { FilterState } from "@/types/filters";
import { Job } from "@/types/job";
import { MongoJob } from "@/app/jobs/actions";

/**
 * Creates a URL query string from a partial FilterState object.
 * Called when the user updates the filter state to generate the new
 * URL to navigate to.
 *
 * @param filterState - Partial FilterState containing the filter parameters to convert
 * @returns A URL-encoded query string
 *
 */
export function CreateQueryString(filterState: Partial<FilterState>): string {
  const params = new URLSearchParams();

  // Handle the nested filters object
  if (filterState.filters) {
    const filters = filterState.filters;

    // Process each filter field
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      if (Array.isArray(value)) {
        // For array values, use the same key multiple times
        // This will create a URL like: key[]=value1&key[]=value2
        value.forEach((v) => params.append(`${key}[]`, v));
      } else {
        // Handle scalar values (e.g., search, page, sortBy)
        params.set(key, value.toString());
      }
    });
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
    source_urls: job.source_urls,
    locations: job.locations,
    industry_field: job.industry_field,
    working_rights: job.working_rights,
    created_at: serializeDate(job.created_at),
    updated_at: serializeDate(job.updated_at),
    type: job.type,
    description: job.description,
    application_url: job.application_url,
    close_date: serializeDate(job.close_date),
  };
}

const UPPERCASE_WORDS = new Set([
  "VIC",
  "NSW",
  "QLD",
  "WA",
  "NT",
  "SA",
  "ACT",
  "TAS",
  "PR",
  "NZ",
  "AUS",
]);

/**
 * Converts a capitalized string with underscores to title case with spaces
 * Example: "VISA_SPONSORED" -> "Visa Sponsored"
 * Example: "AUSTRALIA" -> "Australia"
 *
 * @param str - The uppercase string to convert
 * @returns A formatted string in title case
 */
export function formatCapString(str: string | undefined): string {
  if (!str) {
    return "";
  }
  return str
    .split("_")
    .map((word) => {
      // Check if word should remain uppercase
      if (UPPERCASE_WORDS.has(word)) {
        return word;
      }
      // Convert other words to title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}d ago`;
}

export function getPluralLabel(label: string) {
  const irregularPlurals: Record<string, string> = {
    Industry: "Industries",
    // Add more irregular plurals here if needed
  };
  return irregularPlurals[label] || `${label}s`;
}

export function formatISODate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
