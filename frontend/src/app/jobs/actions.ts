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

export async function getJobs(filters: Partial<JobFilters>): Promise<Job[]> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MongoDB URI is not configured. Please check environment variables.",
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI ?? "");

  try {
    await client.connect();
    const collection = client.db("default").collection("active_jobs");

    const query = {
      outdated: false,
      ...(filters.workingRights?.length && {
        working_rights: { $in: filters.workingRights },
      }),
      ...(filters.jobTypes?.length && { type: { $in: filters.jobTypes } }),
      ...(filters.industryFields?.length && {
        industry_field: { $in: filters.industryFields },
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

    const jobs = (await collection
      .find(query)
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray()) as MongoJob[];

    return jobs.map(serializeJob);
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
