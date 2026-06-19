import { MongoClient, ObjectId } from "mongodb";
import { JobFilters, CompanyFacet } from "@/types/filters";
import { Job } from "@/types/job";
import serializeJob from "@/lib/utils";
import logger from "@/lib/logger";
import { LRUCache } from "lru-cache";

const PAGE_SIZE = 20;

// Shared cache for job results
type CacheValue = { jobs: Job[]; total: number } | Job;

const jobCache = new LRUCache<string, CacheValue>({
  max: 500,
  ttl: 1000 * 3600, // 1 hour
  allowStale: false,
});

// Separate cache for company facet counts
const facetCache = new LRUCache<string, CompanyFacet[]>({
  max: 200,
  ttl: 1000 * 3600, // 1 hour
  allowStale: false,
});

// Helper to normalize filters for cache key (handles string vs array for array fields)
function normalizeFiltersForKey(
  filters: Partial<JobFilters>,
): Record<string, string> {
  const arrayFields = [
    "workingRights[]",
    "locations[]",
    "industryFields[]",
    "jobTypes[]",
    "excludedCompanies[]",
  ];
  const normalized: Record<string, string> = {
    search: (filters.search || "").toLowerCase().trim(),
    page: (filters.page || 1).toString(),
  };

  arrayFields.forEach((field) => {
    const val = filters[field as keyof Partial<JobFilters>];
    if (val !== undefined) {
      const arr = Array.isArray(val)
        ? val
        : typeof val === "string"
          ? [val]
          : [];
      normalized[field] = arr.sort().join(",");
    }
  });

  // Include other scalar fields if present
  if (filters.jobTypes)
    normalized.jobTypes = (filters.jobTypes as string[]).sort().join(",");
  if (filters.locations)
    normalized.locations = (filters.locations as string[]).sort().join(",");
  // Add similar for others if needed, but since searchParams uses [] keys, prioritize those

  return normalized;
}

/**
 * Reads an array-valued filter, tolerating both URL-style keys (e.g.
 * "jobTypes[]" coming from searchParams) and plain JobFilters keys (e.g.
 * "jobTypes" coming from the client). A single value is wrapped into an array.
 */
function readArrayFilter(
  source: Record<string, unknown>,
  bracketKey: string,
  plainKey: string,
): string[] {
  const val = source[bracketKey] ?? source[plainKey];
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? (val as string[]) : [String(val)];
}

/**
 * Helper function to build a query object from filters.
 * @param filters - The job filters from the client (URL-style or plain keys).
 * @param additional - Additional query overrides (e.g. { is_sponsored: true }).
 * @param options - includeCompanyExclusion (default true): set false when
 *   building the company-facet match so a facet ignores its own selection.
 * @returns The query object to use with MongoDB.
 */
function buildJobQuery(
  filters: Partial<JobFilters>,
  additional?: Record<string, unknown>,
  options?: { includeCompanyExclusion?: boolean },
) {
  const includeCompanyExclusion = options?.includeCompanyExclusion ?? true;
  const raw = JSON.parse(JSON.stringify(filters)) as Record<string, unknown>;

  const workingRights = readArrayFilter(
    raw,
    "workingRights[]",
    "workingRights",
  );
  const locations = readArrayFilter(raw, "locations[]", "locations");
  const industryFields = readArrayFilter(
    raw,
    "industryFields[]",
    "industryFields",
  );
  const jobTypes = readArrayFilter(raw, "jobTypes[]", "jobTypes");
  const excludedCompanies = readArrayFilter(
    raw,
    "excludedCompanies[]",
    "excludedCompanies",
  );

  const query = {
    outdated: false,
    ...(workingRights.length && { working_rights: { $in: workingRights } }),
    ...(locations.length && { locations: { $in: locations } }),
    ...(industryFields.length && { industry_field: { $in: industryFields } }),
    ...(jobTypes.length && { type: { $in: jobTypes } }),
    ...(includeCompanyExclusion &&
      excludedCompanies.length && {
        "company.name": { $nin: excludedCompanies },
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

const SPONSOR_TIERS: Record<string, number> = {
  // Platinum (rank 0) — highest priority
  "Jane Street": 0,
  Atlassian: 0,
  // Gold (rank 1)
  "Citadel Securities": 1,
  Canva: 1,
  "Lyra Technologies": 1,
  Susquehanna: 1,
  IMC: 1,
  Vivcourt: 1,
  // Silver (rank 2)
  "January Capital": 2,
  Optiver: 2,
};

/**
 * Fetches paginated and filtered job listings from MongoDB.
 */
export async function getJobs(
  filters: Partial<JobFilters>,
  minSponsors: number = -1,
): Promise<{ jobs: Job[]; total: number }> {
  const page = filters.page || 1;
  const normalizedFilters = normalizeFiltersForKey(filters);
  const cacheKey = `jobs:${JSON.stringify(normalizedFilters)}:${page}:${minSponsors}`;

  // Check cache first
  const cached = jobCache.get(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, "Returning cached jobs");
    return cached as { jobs: Job[]; total: number };
  }

  logger.info({ filters, minSponsors }, "Fetching jobs with filters");

  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const query = buildJobQuery(filters);
    minSponsors = minSponsors === -1 ? (page == 1 ? 3 : 0) : minSponsors;

    try {
      if (minSponsors == 0) {
        const [jobs, total] = await Promise.all([
          collection
            .find(query)
            .sort({ created_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toArray(),
          collection.countDocuments(query),
        ]);
        logger.debug({ total }, "Fetched non-sponsored jobs");
        const result = {
          jobs: (jobs as MongoJob[])
            .map(serializeJob)
            .map((job) => ({ ...job, highlight: false })),
          total,
        };
        jobCache.set(cacheKey, result);
        return result;
      } else {
        const sponsoredQuery = { ...query, is_sponsored: true };

        let sponsoredJobs = await collection
          .aggregate([
            { $match: sponsoredQuery },
            { $sample: { size: minSponsors * 8 } },
          ])
          .toArray();

        // Sort by tier (platinum=0 first, gold=1, silver=2, unknown=3),
        // shuffling randomly within each tier.
        sponsoredJobs = sponsoredJobs
          .map((job) => ({
            job,
            rank: SPONSOR_TIERS[job.company?.name as string] ?? 3,
            rand: Math.random(),
          }))
          .sort((a, b) => a.rank - b.rank || a.rand - b.rand)
          .map(({ job }) => job)
          .slice(0, minSponsors)
          .map((job) => ({ ...job, highlight: true }));

        const sponsoredJobIds = sponsoredJobs.map((job) => job._id);

        const filteredQuery = { ...query, _id: { $nin: sponsoredJobIds } };

        const [otherJobs, total] = await Promise.all([
          collection
            .find(filteredQuery)
            .sort({ created_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
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
        const result = {
          jobs: (mergedJobs as MongoJob[]).map(serializeJob),
          total,
        };
        jobCache.set(cacheKey, result);
        return result;
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
  const cacheKey = `job:${id}`;

  // Check cache first
  const cached = jobCache.get(cacheKey);
  if (cached) {
    logger.debug({ id }, "Returning cached job");
    return cached as Job;
  }

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
    const serializedJob = serializeJob(job as MongoJob);
    jobCache.set(cacheKey, serializedJob);
    return serializedJob;
  });
}

/**
 * Builds a stable cache key for company facets. Intentionally ignores
 * `excludedCompanies` and `page`: a facet's counts must not depend on its own
 * selection or on pagination.
 */
function companyFacetCacheKey(filters: Partial<JobFilters>): string {
  const sorted = (val: unknown): string => {
    const arr = Array.isArray(val)
      ? (val as string[])
      : val
        ? [String(val)]
        : [];
    return [...arr].sort().join(",");
  };
  const f = filters as Record<string, unknown>;
  const norm = {
    search: (filters.search || "").toLowerCase().trim(),
    jobTypes: sorted(f["jobTypes[]"] ?? f.jobTypes),
    locations: sorted(f["locations[]"] ?? f.locations),
    industryFields: sorted(f["industryFields[]"] ?? f.industryFields),
    workingRights: sorted(f["workingRights[]"] ?? f.workingRights),
  };
  return `facets:companies:${JSON.stringify(norm)}`;
}

/**
 * Aggregates the number of listings per company for the current filter set.
 *
 * The company exclusion (`excludedCompanies`) is deliberately NOT applied so the
 * counts reflect "what's available" regardless of which companies are hidden -
 * this is the standard faceted-search rule. The results are sorted by count
 * descending (then name ascending) and cached for 1 hour.
 */
export async function getCompanyFacets(
  filters: Partial<JobFilters>,
): Promise<CompanyFacet[]> {
  const cacheKey = companyFacetCacheKey(filters);

  const cached = facetCache.get(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, "Returning cached company facets");
    return cached;
  }

  logger.info({ filters }, "Fetching company facets");

  return await withDbConnection(async (client) => {
    const collection = client.db("default").collection("active_jobs");
    const query = buildJobQuery(filters, undefined, {
      includeCompanyExclusion: false,
    });

    try {
      const results = await collection
        .aggregate<{
          _id: string;
          count: number;
        }>([
          { $match: query },
          { $group: { _id: "$company.name", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ])
        .toArray();

      const facets: CompanyFacet[] = results
        .filter((r) => typeof r._id === "string" && r._id.length > 0)
        .map((r) => ({ company: r._id, count: r.count }));

      facetCache.set(cacheKey, facets);
      logger.debug({ count: facets.length }, "Fetched company facets");
      return facets;
    } catch (error) {
      logger.error({ query, filters }, "Error fetching company facets");
      throw error;
    }
  });
}

// Define the MongoJob interface with the correct DB field names.
export interface MongoJob extends Omit<Job, "id"> {
  _id: ObjectId;
  is_sponsored: boolean;
}
