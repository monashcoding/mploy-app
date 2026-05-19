"use server";

import { getMongoClientPromise } from "@/lib/mongodb";

const COLLECTION = "job_apply_clicks";

export async function trackApplyClick(job: {
  jobId: string;
  jobTitle: string;
  companyName: string;
}) {
  try {
    const client = await getMongoClientPromise();
    const db = client.db();
    await db.collection(COLLECTION).insertOne({
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      clickedAt: new Date(),
    });
  } catch {
    // Non-critical — don't surface tracking errors to the user
  }
}
