import { Job, JobFilters } from "@/types/job";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchJobs(filters: JobFilters): Promise<Job[]> {
  try {
    // TODO: Implement actual API call
    // For now return empty array
    return [];
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}
