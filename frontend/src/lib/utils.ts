import { FilterState } from "@/types/filters";
import { Job, WORKING_RIGHTS, WorkingRight } from "@/types/job";
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
    one_liner: job.one_liner,
    application_url: job.application_url,
    close_date: serializeDate(job.close_date),
    is_sponsored: job.is_sponsored,
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

export const formatWorkingRights = (rights: WorkingRight[]): string => {
  // If all rights are present, return "Any"
  if (rights.length === WORKING_RIGHTS.length) {
    return "Any Working Rights";
  }

  // Check for AUS and NZ Citizens/PR combination
  const hasAus = rights.includes("AUS_CITIZEN_PR");
  const hasNz = rights.includes("NZ_CITIZEN_PR");
  if (hasAus && hasNz) {
    return "AUS & NZ Citizen/PR";
  }

  // Format remaining cases
  return rights
    .map((right) => {
      switch (right) {
        case "AUS_CITIZEN_PR":
          return "AUS Citizen/PR";
        case "NZ_CITIZEN_PR":
          return "NZ Citizen/PR";
        case "INTERNATIONAL":
          return "International";
        case "OTHER_RIGHTS":
          return "Other";
        default:
          return formatCapString(right);
      }
    })
    .join(", ");
};

// Sponsor util
export interface SponsorCompany {
  companyName: string;
  isPlatinum: boolean;
  jobs: Job[];
  companyLogo: string;
  website: string;
}

/**
 * Groups sponsored jobs by company.
 * @param sponsoredJobs - Array of sponsored Job objects.
 * @param platinumSponsors - Array of company names that are platinum sponsors.
 * @returns An array of SponsorCompany objects.
 */
export function groupSponsoredJobsByCompany(
  sponsoredJobs: Job[],
  platinumSponsors: string[],
): SponsorCompany[] {
  const sponsorsByCompany: {
    [companyName: string]: {
      jobs: Job[];
      companyLogo: string;
      website: string;
    };
  } = {};

  sponsoredJobs.forEach((job) => {
    const companyName = job.company.name;
    if (!sponsorsByCompany[companyName]) {
      sponsorsByCompany[companyName] = {
        jobs: [],
        companyLogo: job.company.logo ?? "",
        website: job.company.website ?? "",
      };
    }
    sponsorsByCompany[companyName].jobs.push(job);
  });

  return Object.entries(sponsorsByCompany).map(([companyName, data]) => ({
    companyName,
    isPlatinum: platinumSponsors.includes(companyName),
    jobs: data.jobs,
    companyLogo: data.companyLogo,
    website: data.website,
  }));
}

/**
 * Picks a random company from an array using weighted selection.
 * @param sponsorCompanies - Array of SponsorCompany objects.
 * @returns A randomly selected SponsorCompany or null.
 */
function pickRandomCompany(
  sponsorCompanies: SponsorCompany[],
): SponsorCompany | null {
  const platinum = sponsorCompanies.filter((c) => c.isPlatinum);
  const nonPlatinum = sponsorCompanies.filter((c) => !c.isPlatinum);
  const choosePlatinum = Math.random() < 0.65 && platinum.length > 0;
  const pool = choosePlatinum
    ? platinum
    : nonPlatinum.length > 0
      ? nonPlatinum
      : platinum;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns a specified number of unique sponsored jobs (slots).
 * Allows the same company to be chosen multiple times if different jobs are available.
 * @param sponsoredJobs - Array of sponsored Job objects.
 * @param platinumSponsors - Array of company names that are platinum sponsors.
 * @param slots - Number of sponsored slots to pick.
 * @returns An array of Job objects to be used as sponsored slots.
 */
export function getSponsoredSlots(
  sponsoredJobs: Job[],
  platinumSponsors: string[],
  slots: number,
): Job[] {
  const sponsorCompanies = groupSponsoredJobsByCompany(
    sponsoredJobs,
    platinumSponsors,
  );
  const sponsoredSlots: Job[] = [];
  const usedJobIds = new Set<string>();

  for (let i = 0; i < slots; i++) {
    let company = pickRandomCompany(sponsorCompanies);
    let attempts = 0;
    let randomJob: Job | undefined;
    while (attempts < 20) {
      if (!company) break;
      const candidate =
        company.jobs[Math.floor(Math.random() * company.jobs.length)];
      if (!usedJobIds.has(candidate.id)) {
        randomJob = candidate;
        break;
      }
      attempts++;
      company = pickRandomCompany(sponsorCompanies);
    }
    if (company && randomJob && !usedJobIds.has(randomJob.id)) {
      usedJobIds.add(randomJob.id);
      sponsoredSlots.push(randomJob);
    }
  }
  return sponsoredSlots;
}
