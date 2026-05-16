"use server";

import { getMongoClientPromise } from "@/lib/mongodb";
import { getAuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import {
  ApplicationJobSnapshot,
  ApplicationStatus,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  LocalApplication,
  RecruitmentCycle,
} from "@/types/application";

type RecruitmentCycleRecord = {
  userId: ObjectId;
  cycleId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requireUserId(session: any) {
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
}

function serializeCycle(
  doc: Partial<RecruitmentCycleRecord>,
): RecruitmentCycle {
  const now = new Date().toISOString();

  return {
    id: doc.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
    name: doc.name ?? "Current cycle",
    isDefault: doc.isDefault ?? false,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : now,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : now,
  };
}

async function ensureDefaultCycle(db: Db, userObjectId: ObjectId) {
  const now = new Date();

  await db.collection<RecruitmentCycleRecord>("application_cycles").updateOne(
    { userId: userObjectId, cycleId: DEFAULT_RECRUITMENT_CYCLE_ID },
    {
      $setOnInsert: {
        userId: userObjectId,
        cycleId: DEFAULT_RECRUITMENT_CYCLE_ID,
        name: "Current cycle",
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

export async function listRecruitmentCycles(): Promise<RecruitmentCycle[]> {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);
  const userObjectId = new ObjectId(userId);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await ensureDefaultCycle(db, userObjectId);

  const docs = await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .find({ userId: userObjectId })
    .sort({ isDefault: -1, createdAt: 1 })
    .toArray();

  return docs.map(serializeCycle);
}

export async function createRecruitmentCycle(
  name: string,
): Promise<RecruitmentCycle> {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);
  const userObjectId = new ObjectId(userId);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Cycle name is required");

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();
  const cycleId = new ObjectId().toString();
  const doc = {
    userId: userObjectId,
    cycleId,
    name: trimmed,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  await ensureDefaultCycle(db, userObjectId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .insertOne(doc);

  return serializeCycle(doc);
}

export async function renameRecruitmentCycle(
  cycleId: string,
  name: string,
): Promise<RecruitmentCycle> {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);
  const userObjectId = new ObjectId(userId);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Cycle name is required");

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();

  await ensureDefaultCycle(db, userObjectId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .updateOne(
      { userId: userObjectId, cycleId },
      { $set: { name: trimmed, updatedAt: now } },
    );

  const doc = await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .findOne({ userId: userObjectId, cycleId });

  if (!doc) throw new Error("Cycle not found");
  return serializeCycle(doc);
}

export async function deleteRecruitmentCycle(cycleId: string) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);
  const userObjectId = new ObjectId(userId);
  if (cycleId === DEFAULT_RECRUITMENT_CYCLE_ID) {
    throw new Error("The default cycle cannot be deleted");
  }

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await ensureDefaultCycle(db, userObjectId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .deleteOne({ userId: userObjectId, cycleId });
  const moved = await db.collection("applications").updateMany(
    { userId: userObjectId, cycleId },
    {
      $set: { cycleId: DEFAULT_RECRUITMENT_CYCLE_ID, updatedAt: new Date() },
    },
  );

  return { ok: true, moved: moved.modifiedCount };
}

export async function syncLocalApplications(apps: LocalApplication[]) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  if (!apps.length) return { ok: true, upserted: 0 };

  const client = await getMongoClientPromise();
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
          cycleId: app.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
          ...(app.starred !== undefined ? { starred: app.starred } : {}),
        },
      },
      { upsert: true },
    );
    upserted += 1;
  }

  return { ok: true, upserted };
}

export async function listApplications(): Promise<DbApplication[]> {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const docs = await db
    .collection("applications")
    .find({ userId: new ObjectId(userId) })
    .sort({ updatedAt: -1 })
    .limit(500)
    .toArray();

  if (!docs.length) return [];

  const jobIds = docs
    .map((d) => {
      try {
        return new ObjectId(d.jobId);
      } catch {
        return null;
      }
    })
    .filter((id): id is ObjectId => id !== null);

  const logoMap = new Map<string, string | undefined>();
  if (jobIds.length) {
    const jobs = await db
      .collection("active_jobs")
      .find(
        { _id: { $in: jobIds } },
        { projection: { _id: 1, "company.logo": 1 } },
      )
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
    cycleId: d.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
    notes: d.notes ?? undefined,
    starred: d.starred ?? false,
  })) as DbApplication[];
}

export async function addApplication(
  jobId: string,
  jobSnapshot: ApplicationJobSnapshot,
) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();

  await db.collection("applications").updateOne(
    { userId: new ObjectId(userId), jobId },
    {
      $set: { updatedAt: now, jobSnapshot },
      $setOnInsert: {
        startedAt: now,
        status: "STARTED",
        cycleId: DEFAULT_RECRUITMENT_CYCLE_ID,
      },
    },
    { upsert: true },
  );

  return { ok: true };
}

export async function deleteApplication(jobId: string) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
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
  date: string,
  cycleId = DEFAULT_RECRUITMENT_CYCLE_ID,
): Promise<DbApplication> {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const jobId = `custom_${new ObjectId().toString()}`;
  const jobSnapshot: ApplicationJobSnapshot = { jobId, title, companyName };
  const parsedDate = new Date(date);

  const result = await db.collection("applications").insertOne({
    userId: new ObjectId(userId),
    jobId,
    status,
    cycleId,
    startedAt: parsedDate,
    updatedAt: parsedDate,
    jobSnapshot,
  });

  return {
    _id: result.insertedId.toString(),
    jobId,
    status,
    cycleId,
    startedAt: parsedDate.toISOString(),
    updatedAt: parsedDate.toISOString(),
    jobSnapshot,
  };
}

export async function updateApplicationStatus(
  jobId: string,
  status: ApplicationStatus,
) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db.collection("applications").updateOne(
    { userId: new ObjectId(userId), jobId },
    {
      $set: { status, updatedAt: new Date() },
      $setOnInsert: {
        startedAt: new Date(),
        cycleId: DEFAULT_RECRUITMENT_CYCLE_ID,
      },
    },
    { upsert: true },
  );

  return { ok: true };
}

export async function toggleApplicationStar(jobId: string, starred: boolean) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db
    .collection("applications")
    .updateOne({ userId: new ObjectId(userId), jobId }, { $set: { starred } });

  return { ok: true, starred };
}

export async function updateApplicationNotes(jobId: string, notes: string) {
  const session = await getServerSession(getAuthOptions());
  const userId = requireUserId(session);

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const hasNotes = notes.trim().length > 0;
  const update = hasNotes
    ? { $set: { notes, updatedAt: new Date() } }
    : { $unset: { notes: "" }, $set: { updatedAt: new Date() } };

  await db
    .collection("applications")
    .updateOne({ userId: new ObjectId(userId), jobId }, update);

  return { ok: true, notes: hasNotes ? notes : undefined };
}
