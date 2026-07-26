"use server";

import { getMongoClientPromise } from "@/lib/mongodb";

const VIEWS_COLLECTION = "job_views";
const CLICKS_COLLECTION = "job_apply_clicks";

export async function trackJobView(data: {
  jobId: string;
  ref?: string | null;
}) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db();
    await db.collection(VIEWS_COLLECTION).insertOne({
      jobId: data.jobId,
      ref: data.ref || null,
      viewedAt: new Date(),
    });
  } catch {
    // Non-critical — don't surface tracking errors to the user
  }
}

export async function trackApplyClick(job: {
  jobId: string;
  jobTitle: string;
  companyName: string;
  ref?: string | null;
}) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db();
    await db.collection(CLICKS_COLLECTION).insertOne({
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      ref: job.ref || null,
      clickedAt: new Date(),
    });
  } catch {
    // Non-critical — don't surface tracking errors to the user
  }
}
