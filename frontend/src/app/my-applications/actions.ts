"use server";

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { ApplicationJobSnapshot, ApplicationStatus, DbApplication, LocalApplication } from "@/types/application";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requireUserId(session: any) {
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function syncLocalApplications(apps: LocalApplication[]) {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  if (!apps.length) return { ok: true, upserted: 0 };

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const collection = db.collection("applications");

  let upserted = 0;

  for (const app of apps) {
    await collection.updateOne(
      { userId: new ObjectId(userId), jobId: app.jobId },
      {
        $setOnInsert: {
          startedAt: new Date(app.startedAt),
        },
        $set: {
          updatedAt: new Date(app.updatedAt),
          status: app.status,
          jobSnapshot: app.jobSnapshot,
        },
      },
      { upsert: true },
    );
    upserted += 1;
  }

  return { ok: true, upserted };
}

export async function listApplications(): Promise<DbApplication[]> {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const docs = await db
    .collection("applications")
    .find({ userId: new ObjectId(userId) })
    .sort({ updatedAt: -1 })
    .limit(500)
    .toArray();

  if (!docs.length) return [];

  // Bulk-fetch logos from active_jobs for snapshots that don't have one
  const jobIds = docs
    .map((d) => { try { return new ObjectId(d.jobId); } catch { return null; } })
    .filter((id): id is ObjectId => id !== null);

  const logoMap = new Map<string, string | undefined>();
  if (jobIds.length) {
    const jobs = await db
      .collection("active_jobs")
      .find({ _id: { $in: jobIds } }, { projection: { _id: 1, "company.logo": 1 } })
      .toArray();
    for (const job of jobs) {
      logoMap.set(job._id.toString(), job.company?.logo);
    }
  }

  return docs.map((d) => ({
    _id: d._id.toString(),
    jobId: d.jobId,
    status: d.status,
    startedAt: new Date(d.startedAt).toISOString(),
    updatedAt: new Date(d.updatedAt).toISOString(),
    jobSnapshot: {
      ...d.jobSnapshot,
      logo: d.jobSnapshot.logo ?? logoMap.get(d.jobId),
    },
  })) as DbApplication[];
}

export async function addApplication(jobId: string, jobSnapshot: import("@/types/application").ApplicationJobSnapshot) {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();

  await db.collection("applications").updateOne(
    { userId: new ObjectId(userId), jobId },
    {
      $set: { updatedAt: now, jobSnapshot },
      $setOnInsert: { startedAt: now, status: "STARTED" },
    },
    { upsert: true },
  );

  return { ok: true };
}

export async function deleteApplication(jobId: string) {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db.collection("applications").deleteOne({
    userId: new ObjectId(userId),
    jobId,
  });

  return { ok: true };
}

export async function createCustomApplication(
  title: string,
  companyName: string,
  status: ApplicationStatus,
  date: string, // "YYYY-MM-DD"
): Promise<DbApplication> {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const jobId = `custom_${new ObjectId().toString()}`;
  const jobSnapshot: ApplicationJobSnapshot = { jobId, title, companyName };
  const parsedDate = new Date(date);

  const result = await db.collection("applications").insertOne({
    userId: new ObjectId(userId),
    jobId,
    status,
    startedAt: parsedDate,
    updatedAt: parsedDate,
    jobSnapshot,
  });

  return {
    _id: result.insertedId.toString(),
    jobId,
    status,
    startedAt: parsedDate.toISOString(),
    updatedAt: parsedDate.toISOString(),
    jobSnapshot,
  };
}

export async function updateApplicationStatus(jobId: string, status: ApplicationStatus) {
  const session = await getServerSession(authOptions);
  const userId = requireUserId(session);

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db.collection("applications").updateOne(
    { userId: new ObjectId(userId), jobId },
    {
      $set: { status, updatedAt: new Date() },
      $setOnInsert: { startedAt: new Date() },
    },
    { upsert: true },
  );

  return { ok: true };
}

