import { Job } from "@/types/job";
import { JobFilters } from "@/types/filters";

export async function fetchJobs(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters: Partial<JobFilters>,
): Promise<{ jobs: Job[]; total: number }> {
  try {
    const url = new URL(window.location.href + "/api/jobs");
    url.searchParams.set("offset", "0");
    url.searchParams.set("limit", "100");
    url.searchParams.set("outdated", "false");

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
