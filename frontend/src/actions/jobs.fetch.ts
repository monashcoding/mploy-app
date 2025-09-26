import { MongoClient, ObjectId } from "mongodb";
import { JobFilters } from "@/types/filters";
import { Job } from "@/types/job";
import serializeJob from "@/lib/utils";
import logger from "@/lib/logger";

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
    logger.error("MONGODB_URI environment variable is not set");
    throw new Error(
      "MongoDB URI is not configured. Please check environment variables.",
    );
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    logger.debug("MongoDB connected successfully");
    return await callback(client);
  } catch (error) {
    logger.error(error, "Failed to connect to MongoDB or execute callback");
    throw error;
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
  logger.info(
    { filters, minSponsors, prioritySponsors },
    "Fetching jobs with filters",
  );
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const query = buildJobQuery(filters);
    const page = filters.page || 1;
    const skip = (page - 1) * PAGE_SIZE;
    minSponsors = minSponsors === -1 ? (page == 1 ? 3 : 0) : minSponsors;

    try {
      if (minSponsors == 0) {
        const [jobs, total] = await Promise.all([
          collection
            .find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(PAGE_SIZE)
            .toArray(),
          collection.countDocuments(query),
        ]);
        logger.debug({ total }, "Fetched non-sponsored jobs");
        return {
          jobs: (jobs as MongoJob[])
            .map(serializeJob)
            .map((job) => ({ ...job, highlight: false })),
          total,
        };
      } else {
        const sponsoredQuery = { ...query, is_sponsored: true };

        let sponsoredJobs = await collection
          .aggregate([
            { $match: sponsoredQuery },
            { $sample: { size: minSponsors * 8 } },
          ])
          .toArray();

        sponsoredJobs = sponsoredJobs
          .filter((job) => {
            const isPriority = prioritySponsors.includes(job.company.name);
            return isPriority ? Math.random() < 0.65 : Math.random() >= 0.35;
          })
          .slice(0, minSponsors)
          .map((job) => ({ ...job, highlight: true }));

        const sponsoredJobIds = sponsoredJobs.map((job) => job._id);

        const filteredQuery = { ...query, _id: { $nin: sponsoredJobIds } };

        const [otherJobs, total] = await Promise.all([
          collection
            .find(filteredQuery)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(PAGE_SIZE - sponsoredJobs.length)
            .toArray(),
          collection.countDocuments(query),
        ]);

        const mergedJobs = [
          ...sponsoredJobs.map((job) => ({ ...job, highlight: true })),
          ...otherJobs.map((job) => ({ ...job, highlight: false })),
        ].slice(0, PAGE_SIZE);

        logger.debug(
          {
            sponsoredCount: sponsoredJobs.length,
            otherCount: otherJobs.length,
            total,
          },
          "Fetched sponsored and other jobs",
        );
        return {
          jobs: (mergedJobs as MongoJob[]).map(serializeJob),
          total,
        };
      }
    } catch (error) {
      logger.error({ query, filters }, "Error fetching jobs");
      throw error;
    }
  });
}

/**
 * Fetches a single job by its id.
 */
export async function getJobById(id: string): Promise<Job | null> {
  logger.info({ id }, "Fetching job by ID");
  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const job = await collection.findOne({
      _id: new ObjectId(id),
      outdated: false,
    });
    if (!job) {
      logger.warn({ id }, "Job not found");
      return null;
    }
    logger.debug({ id }, "Job fetched successfully");
    return serializeJob(job as MongoJob);
  });
}
