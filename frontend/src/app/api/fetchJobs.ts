import { Job } from "@/types/job";
import { JobFilters } from "@/types/filters";

export async function fetchJobs(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters: Partial<JobFilters>,
): Promise<{ jobs: Job[]; total: number }> {
  try {
    // TODO: Implement actual API call
    // For now return mock data
    return {
      jobs: [],
      total: 0,
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}
