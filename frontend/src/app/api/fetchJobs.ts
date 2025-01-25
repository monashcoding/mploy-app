import { Job } from "@/types/job";
import { JobFilters } from "@/types/filters";

/**
 * This function would handle fetching jobs from the API and type conversion
 *
 * @param filters - Filters to apply to the job search
 * @returns - A list of jobs and the total number of jobs
 */
export async function fetchJobs(filters: Partial<JobFilters>): Promise<{ jobs: Job[]; total: number }> {
  try {
    const url = new URL(window.location.href + "/api/jobs");
    // Add Offset. e.g. Only want listings after the first 10
    url.searchParams.set("offset", "10");

    // Add Offset. e.g. Only want api to return a max of 100 listings
    url.searchParams.set("limit", "100");

    // By default the api will not return outdated listings, you can provide outdated = true to get outdated listings
    url.searchParams.set("outdated", "false");

    // Filter by working rights
    url.searchParams.set(
      "working_rights",
      "aus_citizen,other_rights,visa_sponsored",
    );

    // Filter by job types
    url.searchParams.set("types", "graduate,intern");

    // Filter by industry fields
    url.searchParams.set("industry_fields", "banks,tech");

    // Search for keyword in job title or company name
    url.searchParams.set("keyword", "developer");

    // Handle Reponse
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      jobs: data,
      total: data.length,
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}
