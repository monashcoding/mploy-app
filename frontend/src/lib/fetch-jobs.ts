import { Job } from "@/types/job";
import { JobFilters, SortBy } from "@/types/filters";

export interface JobsApiResponse {
  jobs: Job[];
  total: number;
}

const PAGE_SIZE = 20; // Number of jobs per page

/**
 * Fetches jobs from the API given a set of filters
 * This should not be manually called, rather done through the JobsPage component
 * See api/jobs/route.ts for the API implementation details
 * 
 * @param filters - Filters to apply to the job search
 * @returns - A list of jobs and the total number of matching jobs
 */
export async function fetchJobs(filters: Partial<JobFilters>): Promise<JobsApiResponse> {
  try {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { jobs, total } = await response.json() as JobsApiResponse;
    
    return {
      jobs,
      total
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}
