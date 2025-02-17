// /src/app/jobs/actions.ts
"use server";

import { MongoClient, ObjectId } from "mongodb";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";

import serializeJob from "@/lib/utils";

const PAGE_SIZE = 20;

export interface MongoJob extends Omit<Job, "id"> {
  _id: ObjectId;
}

/**
 * Fetches paginated and filtered job listings from MongoDB.
 *
 * @param filters - Partial JobFilters object containing:
 *   - workingRights?: Array of required working rights
 *   - jobTypes?: Array of job types to include
 *   - industryFields?: Array of industry fields
 *   - search?: Full-text search on job titles and company names (case-insensitive)
 *   - page?: Page number (defaults to 1)
 *
 * @returns Promise containing:
 *   - jobs: Array of serialized Job objects
 *   - total: Total count of jobs matching the filters
 *
 * @throws Error if MongoDB connection fails or if MONGODB_URI is not configured
 */
export async function getJobs(
  filters: Partial<JobFilters>,
): Promise<{ jobs: Job[]; total: number }> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MongoDB URI is not configured. Please check environment variables.",
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI ?? "");

  try {
    await client.connect();
    const collection = client.db("default").collection("active_jobs");
    const array_jobs = JSON.parse(JSON.stringify(filters, null, 2));
    // Build the query object with proper typing
    const query = {
      outdated: false,
      ...(array_jobs["workingRights[]"] !== undefined &&
        array_jobs["workingRights[]"].length && {
          working_rights: {
            $in: Array.isArray(array_jobs["workingRights[]"])
              ? array_jobs["workingRights[]"]
              : [array_jobs["workingRights[]"]],
          },
        }),
      ...(array_jobs["locations[]"] !== undefined &&
        array_jobs["locations[]"].length && {
          locations: {
            $in: Array.isArray(array_jobs["locations[]"])
              ? array_jobs["locations[]"]
              : [array_jobs["locations[]"]],
          },
        }),
      ...(array_jobs["industryFields[]"] !== undefined &&
        array_jobs["industryFields[]"].length && {
          industry_field: {
            $in: Array.isArray(array_jobs["industryFields[]"])
              ? array_jobs["industryFields[]"]
              : [array_jobs["industryFields[]"]],
          },
        }),
      ...(array_jobs["jobTypes[]"] !== undefined &&
        array_jobs["jobTypes[]"].length && {
          type: {
            $in: Array.isArray(array_jobs["jobTypes[]"])
              ? array_jobs["jobTypes[]"]
              : [array_jobs["jobTypes[]"]],
          },
        }),
      ...(filters.search && {
        $or: [
          { title: { $regex: filters.search, $options: "i" } },
          { "company.name": { $regex: filters.search, $options: "i" } },
        ],
      }),
    };

    const page = filters.page || 1;
    const skip = (page - 1) * PAGE_SIZE;

    const [jobs, total] = await Promise.all([
      collection.find(query).skip(skip).limit(PAGE_SIZE).toArray(),
      collection.countDocuments(query),
    ]);
    return {
      jobs: (jobs as MongoJob[]).map(serializeJob),
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
  } finally {
    await client.close();
  }
}
