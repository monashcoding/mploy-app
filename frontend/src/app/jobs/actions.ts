// /src/app/jobs/actions.ts
"use server";

import { MongoClient, ObjectId } from "mongodb";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";
import serializeJob from "@/lib/utils";

const PAGE_SIZE = 20;

// Define the MongoJob interface with the correct DB field names.
export interface MongoJob extends Omit<Job, "id"> {
  _id: ObjectId;
  is_sponsored: boolean;
}

/**
 * Helper function to build a query object from filters.
 * @param filters - The job filters from the client.
 * @param additional - Additional query overrides (e.g. { is_sponsored: true }).
 * @returns The query object to use with MongoDB.
 */
function buildJobQuery(
  filters: Partial<JobFilters>,
  additional?: Record<string, unknown>
) {
  const array_jobs = JSON.parse(JSON.stringify(filters, null, 2));
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
    ...additional,
  };
  return query;
}

/**
 * Helper function to manage a MongoDB connection.
 * @param callback - The function that uses the connected MongoClient.
 * @returns The result from the callback.
 */
async function withDbConnection<T>(
  callback: (client: MongoClient) => Promise<T>
): Promise<T> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MongoDB URI is not configured. Please check environment variables."
    );
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    return await callback(client);
  } finally {
    await client.close();
  }
}

/**
 * Fetches paginated and filtered job listings from MongoDB.
 */
export async function getJobs(
  filters: Partial<JobFilters>
): Promise<{ jobs: Job[]; total: number }> {
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const query = buildJobQuery(filters);
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
  });
}

/**
 * Fetches all sponsored job listings from MongoDB that match the given filters.
 * This function does not paginate results.
 */
export async function getSponsoredJobs(
  filters: Partial<JobFilters>
): Promise<{ jobs: Job[]; total: number }> {
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    // Add an override to filter only sponsored jobs.
    const query = buildJobQuery(filters, { is_sponsored: true });
    const jobs = await collection.find(query).toArray();
    const total = jobs.length;
    return {
      jobs: (jobs as MongoJob[]).map(serializeJob),
      total,
    };
  });
}

/**
 * Fetches a single job by its id.
 */
export async function getJobById(id: string): Promise<Job | null> {
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const job = await collection.findOne({
      _id: new ObjectId(id),
      outdated: false,
    });
    if (!job) {
      return null;
    }
    return serializeJob(job as MongoJob);
  });
}
