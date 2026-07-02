"use server";

import { getMongoClientPromise } from "@/lib/mongodb";
import { requireMacUserId } from "@/lib/mac-auth";
import logger from "@/lib/logger";
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import {
  ApplicationJobSnapshot,
  ApplicationStatus,
  ApplicationStatusEvent,
  ApplicationStatusEventSource,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  LocalApplication,
  RecruitmentCycle,
} from "@/types/application";

type RecruitmentCycleRecord = {
  userId: string;
  cycleId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ApplicationRecord = {
  _id: ObjectId;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  startedAt: Date;
  updatedAt: Date;
  jobSnapshot: ApplicationJobSnapshot;
  cycleId?: string;
  notes?: string;
  starred?: boolean;
};

type ApplicationStatusEventRecord = {
  _id: ObjectId;
  userId: string;
  jobId: string;
  fromStatus?: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  cycleId?: string;
  source: ApplicationStatusEventSource;
  createdAt: Date;
};

let statusEventIndexesPromise: Promise<string[]> | null = null;

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

function serializeApplication(
  doc: ApplicationRecord,
  fallbackLogo?: string,
): DbApplication {
  return {
    _id: doc._id.toString(),
    jobId: doc.jobId,
    status: doc.status,
    startedAt: new Date(doc.startedAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    jobSnapshot: {
      ...doc.jobSnapshot,
      logo: doc.jobSnapshot.logo ?? fallbackLogo,
    },
    cycleId: doc.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
    notes: doc.notes ?? undefined,
    starred: doc.starred ?? false,
  };
}

function serializeStatusEvent(
  doc: ApplicationStatusEventRecord,
): ApplicationStatusEvent {
  return {
    _id: doc._id.toString(),
    jobId: doc.jobId,
    fromStatus: doc.fromStatus ?? null,
    toStatus: doc.toStatus,
    cycleId: doc.cycleId,
    source: doc.source,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

async function ensureDefaultCycle(db: Db, userId: string) {
  const now = new Date();

  await db.collection<RecruitmentCycleRecord>("application_cycles").updateOne(
    { userId, cycleId: DEFAULT_RECRUITMENT_CYCLE_ID },
    {
      $setOnInsert: {
        userId,
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

async function ensureStatusEventIndexes(db: Db) {
  statusEventIndexesPromise ??= db
    .collection<ApplicationStatusEventRecord>("application_status_events")
    .createIndexes([
      {
        key: { userId: 1, createdAt: -1 },
        name: "application_status_events_user_created",
      },
      {
        key: { userId: 1, jobId: 1, createdAt: 1 },
        name: "application_status_events_user_job_created",
      },
    ]);

  try {
    await statusEventIndexesPromise;
  } catch (error) {
    statusEventIndexesPromise = null;
    logger.warn({ error }, "Failed to ensure application status event indexes");
  }
}

async function recordApplicationStatusEvent(
  db: Db,
  userId: string,
  event: {
    jobId: string;
    fromStatus?: ApplicationStatus | null;
    toStatus: ApplicationStatus;
    cycleId?: string;
    source: ApplicationStatusEventSource;
  },
) {
  if (event.fromStatus === event.toStatus) return;

  try {
    await ensureStatusEventIndexes(db);
    await db
      .collection<ApplicationStatusEventRecord>("application_status_events")
      .insertOne({
        _id: new ObjectId(),
        userId,
        jobId: event.jobId,
        fromStatus: event.fromStatus ?? null,
        toStatus: event.toStatus,
        cycleId: event.cycleId,
        source: event.source,
        createdAt: new Date(),
      });
  } catch (error) {
    logger.warn(
      {
        error,
        jobId: event.jobId,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
      },
      "Failed to record application status event",
    );
  }
}

function parseLocalDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function listRecruitmentCycles(): Promise<RecruitmentCycle[]> {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await ensureDefaultCycle(db, userId);

  const docs = await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .find({ userId })
    .sort({ isDefault: -1, createdAt: 1 })
    .toArray();

  return docs.map(serializeCycle);
}

export async function createRecruitmentCycle(
  name: string,
): Promise<RecruitmentCycle> {
  const userId = await requireMacUserId();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Cycle name is required");

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();
  const cycleId = new ObjectId().toString();
  const doc = {
    userId,
    cycleId,
    name: trimmed,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  await ensureDefaultCycle(db, userId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .insertOne(doc);

  return serializeCycle(doc);
}

export async function renameRecruitmentCycle(
  cycleId: string,
  name: string,
): Promise<RecruitmentCycle> {
  const userId = await requireMacUserId();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Cycle name is required");

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();

  await ensureDefaultCycle(db, userId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .updateOne(
      { userId, cycleId },
      { $set: { name: trimmed, updatedAt: now } },
    );

  const doc = await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .findOne({ userId, cycleId });

  if (!doc) throw new Error("Cycle not found");
  return serializeCycle(doc);
}

export async function deleteRecruitmentCycle(cycleId: string) {
  const userId = await requireMacUserId();
  if (cycleId === DEFAULT_RECRUITMENT_CYCLE_ID) {
    throw new Error("The default cycle cannot be deleted");
  }

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await ensureDefaultCycle(db, userId);
  await db
    .collection<RecruitmentCycleRecord>("application_cycles")
    .deleteOne({ userId, cycleId });
  const moved = await db.collection("applications").updateMany(
    { userId, cycleId },
    {
      $set: { cycleId: DEFAULT_RECRUITMENT_CYCLE_ID, updatedAt: new Date() },
    },
  );

  return { ok: true, moved: moved.modifiedCount };
}

export async function syncLocalApplications(apps: LocalApplication[]) {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const collection = db.collection<ApplicationRecord>("applications");

  if (!apps.length) {
    const current = await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return {
      ok: true,
      upserted: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      applications: current.map((app) => serializeApplication(app)),
    };
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const app of apps) {
    const now = new Date();
    const localStartedAt = parseLocalDate(app.startedAt, now);
    const localUpdatedAt = parseLocalDate(app.updatedAt, localStartedAt);
    const nextCycleId = app.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID;
    const existing = await collection.findOne({
      userId,
      jobId: app.jobId,
    });

    if (!existing) {
      await collection.insertOne({
        _id: new ObjectId(),
        userId,
        jobId: app.jobId,
        status: app.status,
        startedAt: localStartedAt,
        updatedAt: localUpdatedAt,
        jobSnapshot: app.jobSnapshot,
        cycleId: nextCycleId,
        ...(app.starred !== undefined ? { starred: app.starred } : {}),
      });

      await recordApplicationStatusEvent(db, userId, {
        jobId: app.jobId,
        fromStatus: null,
        toStatus: app.status,
        cycleId: nextCycleId,
        source: "local_sync",
      });

      inserted += 1;
      continue;
    }

    if (localUpdatedAt.getTime() <= existing.updatedAt.getTime()) {
      skipped += 1;
      continue;
    }

    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          updatedAt: localUpdatedAt,
          status: app.status,
          jobSnapshot: app.jobSnapshot,
          cycleId: nextCycleId,
          ...(app.starred !== undefined ? { starred: app.starred } : {}),
        },
      },
    );

    await recordApplicationStatusEvent(db, userId, {
      jobId: app.jobId,
      fromStatus: existing.status,
      toStatus: app.status,
      cycleId: nextCycleId,
      source: "local_sync",
    });

    updated += 1;
  }

  const current = await collection
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return {
    ok: true,
    upserted: inserted + updated,
    inserted,
    updated,
    skipped,
    applications: current.map((app) => serializeApplication(app)),
  };
}

export async function listApplications(): Promise<DbApplication[]> {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const docs = await db
    .collection<ApplicationRecord>("applications")
    .find({ userId })
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

  return docs.map((d) => serializeApplication(d, logoMap.get(d.jobId)));
}

export async function listApplicationStatusEvents(
  jobIds: string[],
): Promise<ApplicationStatusEvent[]> {
  const userId = await requireMacUserId();

  if (!jobIds.length) return [];

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  await ensureStatusEventIndexes(db);

  const docs = await db
    .collection<ApplicationStatusEventRecord>("application_status_events")
    .find({
      userId,
      jobId: { $in: Array.from(new Set(jobIds)) },
    })
    .sort({ createdAt: 1 })
    .limit(5000)
    .toArray();

  return docs.map(serializeStatusEvent);
}

export async function addApplication(
  jobId: string,
  jobSnapshot: ApplicationJobSnapshot,
) {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const now = new Date();

  const result = await db.collection("applications").updateOne(
    { userId, jobId },
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

  if (result.upsertedCount > 0) {
    await recordApplicationStatusEvent(db, userId, {
      jobId,
      fromStatus: null,
      toStatus: "STARTED",
      cycleId: DEFAULT_RECRUITMENT_CYCLE_ID,
      source: "application_created",
    });
  }

  return { ok: true };
}

export async function deleteApplication(jobId: string) {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db.collection("applications").deleteOne({
    userId,
    jobId,
  });

  return { ok: true };
}

export async function restoreDeletedApplication(
  application: DbApplication,
): Promise<DbApplication> {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const collection = db.collection<ApplicationRecord>("applications");
  const startedAt = new Date(application.startedAt);
  const updatedAt = new Date(application.updatedAt);
  const hasNotes =
    typeof application.notes === "string" &&
    application.notes.trim().length > 0;

  await collection.updateOne(
    { userId, jobId: application.jobId },
    {
      $set: {
        jobId: application.jobId,
        status: application.status,
        startedAt,
        updatedAt,
        jobSnapshot: application.jobSnapshot,
        cycleId: application.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
        starred: application.starred ?? false,
        ...(hasNotes ? { notes: application.notes } : {}),
      },
      ...(hasNotes ? {} : { $unset: { notes: "" } }),
      $setOnInsert: {
        userId,
      },
    },
    { upsert: true },
  );

  const restored = await collection.findOne({
    userId,
    jobId: application.jobId,
  });

  if (!restored) throw new Error("Application could not be restored");
  return serializeApplication(restored);
}

export async function createCustomApplication(
  title: string,
  companyName: string,
  status: ApplicationStatus,
  date: string,
  cycleId = DEFAULT_RECRUITMENT_CYCLE_ID,
): Promise<DbApplication> {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const jobId = `custom_${new ObjectId().toString()}`;
  const jobSnapshot: ApplicationJobSnapshot = { jobId, title, companyName };
  const parsedDate = new Date(date);

  const result = await db.collection("applications").insertOne({
    userId,
    jobId,
    status,
    cycleId,
    startedAt: parsedDate,
    updatedAt: parsedDate,
    jobSnapshot,
  });

  await recordApplicationStatusEvent(db, userId, {
    jobId,
    fromStatus: null,
    toStatus: status,
    cycleId,
    source: "application_created",
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
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");
  const collection = db.collection<ApplicationRecord>("applications");
  const existing = await collection.findOne({ userId, jobId });

  await collection.updateOne(
    { userId, jobId },
    {
      $set: { status, updatedAt: new Date() },
      $setOnInsert: {
        startedAt: new Date(),
        cycleId: DEFAULT_RECRUITMENT_CYCLE_ID,
      },
    },
    { upsert: true },
  );

  await recordApplicationStatusEvent(db, userId, {
    jobId,
    fromStatus: existing?.status ?? null,
    toStatus: status,
    cycleId: existing?.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID,
    source: "status_change",
  });

  return { ok: true };
}

export async function toggleApplicationStar(jobId: string, starred: boolean) {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  await db
    .collection("applications")
    .updateOne({ userId, jobId }, { $set: { starred } });

  return { ok: true, starred };
}

export async function updateApplicationNotes(jobId: string, notes: string) {
  const userId = await requireMacUserId();

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DATABASE || "default");

  const hasNotes = notes.trim().length > 0;
  const update = hasNotes
    ? { $set: { notes, updatedAt: new Date() } }
    : { $unset: { notes: "" }, $set: { updatedAt: new Date() } };

  await db.collection("applications").updateOne({ userId, jobId }, update);

  return { ok: true, notes: hasNotes ? notes : undefined };
}
