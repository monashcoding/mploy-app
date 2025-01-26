import { Job } from "@/types/job";
import { JobFilters, SortBy } from "@/types/filters";
import { headers } from "next/headers";

export interface JobsApiResponse {
  jobs: Job[];
  total: number;
}

const PAGE_SIZE = 20; // Number of jobs per page
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Fetches jobs from the API given a set of filters
 * This should not be manually called, rather done through the JobsPage component
 * See api/jobs/route.ts for the API implementation details
 *
 * @param filters - Filters to apply to the job search
 * @returns - A list of jobs and the total number of matching jobs
 */
export async function fetchJobs(
  filters: Partial<JobFilters>,
): Promise<JobsApiResponse> {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MongoDB URI is not configured. Please check environment variables.",
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = new URL("/api/jobs", baseUrl);

    // Pagination
    const page = filters.page || 1;
    url.searchParams.set("offset", String((page - 1) * PAGE_SIZE));
    url.searchParams.set("limit", String(PAGE_SIZE));

    // Filters
    if (filters.search) {
      url.searchParams.set("keyword", filters.search);
    }

    if (filters.jobTypes?.length) {
      url.searchParams.set("types", filters.jobTypes.join(","));
    }

    if (filters.industryFields?.length) {
      url.searchParams.set("industry_fields", filters.industryFields.join(","));
    }

    if (filters.workingRights?.length) {
      url.searchParams.set("working_rights", filters.workingRights.join(","));
    }

    // TODO: implement sorting
    // Sorting
    if (filters.sortBy === SortBy.RECENT) {
      // API should sort by createdAt descending by default
    } else if (filters.sortBy === SortBy.RELEVANT) {
      // API should implement relevance scoring
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `[${response.status}] Unable to fetch from MongoDB. ${response.body}. URL Used ${url.toString()}`,
      );
    }

    const { jobs, total } = (await response.json()) as JobsApiResponse;

    return {
      jobs,
      total,
    };
  } catch (error) {
    console.error("Server Error:", {
      error,
      timestamp: new Date().toISOString(),
      filters,
    });
    throw new Error(
      "Failed to fetch jobs from the server. Check the server console for more details.",
    );
  }
}
