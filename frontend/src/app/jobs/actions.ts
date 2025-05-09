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
 * @param additional - Additional query overrides (e.g. { is_sponsor: true }).
 * @returns The query object to use with MongoDB.
 */
function buildJobQuery(
  filters: Partial<JobFilters>,
  additional?: Record<string, unknown>,
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
  callback: (client: MongoClient) => Promise<T>,
): Promise<T> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MongoDB URI is not configured. Please check environment variables.",
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
  filters: Partial<JobFilters>,
  minSponsors: number = -1,
  prioritySponsors: Array<string> = ["IMC", "Atlassian"],
): Promise<{ jobs: Job[]; total: number }> {
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const query = buildJobQuery(filters);
    const page = filters.page || 1;
    const skip = (page - 1) * PAGE_SIZE;
    minSponsors = minSponsors === -1 ? (page == 1 ? 3 : 0) : minSponsors;

    // derive sort object from filters.sortBy
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      recent_desc: { created_at: 1 },
      recent_asc: { created_at: -1 },
      closing_desc: { close_date: 1 },
      closing_asc: { close_date: -1 },
    };

    const sort = sortMap[(filters.sortBy as string) ?? "posted_desc"] ?? {
      created_at: -1,
    };

    if (minSponsors == 0) {
      const [jobs, total] = await Promise.all([
        collection.find(query).sort(sort).skip(skip).limit(PAGE_SIZE).toArray(),
        collection.countDocuments(query),
      ]);
      return {
        // Serialize Job and set highlight to false
        jobs: (jobs as MongoJob[])
          .map(serializeJob)
          .map((job) => ({ ...job, highlight: false })),
        total,
      };
    } else {
      // Modify query to include sponsored job filtering
      const sponsoredQuery = { ...query, is_sponsored: true };

      // Fetch sponsored jobs (without priority filtering)
      let sponsoredJobs = await collection
        .aggregate([
          { $match: sponsoredQuery },
          { $sample: { size: minSponsors * 8 } },
        ])
        .toArray();

      // Apply 65% chance selection for priority sponsors
      sponsoredJobs = sponsoredJobs
        .filter((job) => {
          const isPriority = prioritySponsors.includes(job.company.name);
          return isPriority ? Math.random() < 0.65 : Math.random() >= 0.35; // 65% chance for priority, 35% for others
        })
        .slice(0, minSponsors) // Ensure we only take the required number

        .map((job) => ({ ...job, highlight: true })); // Add highlight property

      // Get IDs of selected sponsored jobs to exclude them from regular jobs
      const sponsoredJobIds = sponsoredJobs.map((job) => job._id);

      // Modify the main query to exclude sponsored jobs we already fetched
      const filteredQuery = { ...query, _id: { $nin: sponsoredJobIds } };

      // Fetch remaining jobs with pagination
      const [otherJobs, total] = await Promise.all([
        collection
          .find(filteredQuery)
          .sort(sort)
          .skip(skip)
          .limit(PAGE_SIZE - sponsoredJobs.length)
          .toArray(),
        collection.countDocuments(query), // Total should still include all jobs matching the original query
      ]);
      // Merge jobs and make sure we don't exceed PAGE_SIZE also add highlight property
      const mergedJobs = [
        ...sponsoredJobs.map((job) => ({ ...job, highlight: true })),
        ...otherJobs.map((job) => ({ ...job, highlight: false })),
      ].slice(0, PAGE_SIZE);

      return {
        jobs: (mergedJobs as MongoJob[]).map(serializeJob),
        total,
      };
    }
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
