"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Checkbox,
  Group,
  Popover,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconChevronDown,
  IconEye,
  IconFilter,
  IconInfoCircle,
  IconLayoutKanban,
  IconSearch,
  IconTimeline,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  ApplicationStatus,
  DbApplication,
  StageColorRole,
  UserStage,
} from "@/types/application";
import {
  clearLocalApplications,
  getLocalApplications,
} from "@/lib/local-applications";
import {
  createCustomApplication,
  deleteApplication,
  syncLocalApplications,
  toggleApplicationStar,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/app/my-applications/actions";
import NotesModal from "@/components/applications/notes-modal";
import ApplicationsKanban, {
  ApplicationsStatStrip,
  KanbanSort,
} from "@/components/applications/applications-kanban";
import ApplicationsTimeline from "@/components/applications/applications-timeline";
import { rolePalette } from "@/lib/role-palette";

type ViewMode = "kanban" | "timeline";
const VIEW_STORAGE_KEY = "mp:apps:view:v1";
const SORT_STORAGE_KEY = "mp:apps:kanban-sort:v1";

function readView(): ViewMode {
  if (typeof window === "undefined") return "kanban";
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (raw === "kanban" || raw === "timeline") return raw;
  } catch {
    // ignore
  }
  return "kanban";
}

function readSort(): KanbanSort {
  if (typeof window === "undefined") return "newest";
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (raw === "newest" || raw === "oldest") return raw;
  } catch {
    // ignore
  }
  return "newest";
}

function StatusDot({ role }: { role: StageColorRole }) {
  const { dot } = rolePalette(role);
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: dot,
        flexShrink: 0,
      }}
    />
  );
}

export default function MyApplicationsClient({
  initial,
  initialStages,
}: {
  initial: DbApplication[];
  initialStages: UserStage[];
}) {
  const { status: sessionStatus } = useSession();
  const [apps, setApps] = useState<DbApplication[]>(initial);
  const stages = initialStages;
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(readView);
  const [sort, setSort] = useState<KanbanSort>(readSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleStages, setVisibleStages] = useState<string[]>(() =>
    stages.map((s) => s.name),
  );
  const [notesAppId, setNotesAppId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // ignore
    }
  }, [view]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SORT_STORAGE_KEY, sort);
    } catch {
      // ignore
    }
  }, [sort]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    const local = getLocalApplications();
    if (!local.length) return;

    (async () => {
      try {
        const res = await syncLocalApplications(local);
        clearLocalApplications();
        setSyncMessage(
          `Synced ${res.upserted} application${res.upserted === 1 ? "" : "s"} from this device.`,
        );
      } catch {
        setSyncMessage("Couldn't sync local applications yet. Try refreshing.");
      }
    })();
  }, [sessionStatus]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (a) =>
        a.jobSnapshot.companyName.toLowerCase().includes(q) ||
        a.jobSnapshot.title.toLowerCase().includes(q),
    );
  }, [apps, searchQuery]);

  async function handleStatusChange(
    appId: string,
    jobId: string,
    oldStatus: ApplicationStatus,
    next: ApplicationStatus,
  ) {
    if (oldStatus === next) return;
    setApps((prev) =>
      prev.map((p) => (p._id === appId ? { ...p, status: next } : p)),
    );
    try {
      await updateApplicationStatus(jobId, next);
    } catch {
      setApps((prev) =>
        prev.map((p) => (p._id === appId ? { ...p, status: oldStatus } : p)),
      );
    }
  }

  async function handleDelete(appId: string, jobId: string) {
    const removed = apps.find((a) => a._id === appId);
    setApps((prev) => prev.filter((a) => a._id !== appId));
    try {
      await deleteApplication(jobId);
    } catch {
      if (removed) setApps((prev) => [removed, ...prev]);
    }
  }

  async function handleClearStage(stageName: string) {
    const toRemove = apps.filter((a) => a.status === stageName);
    if (toRemove.length === 0) return;
    const removedIds = new Set(toRemove.map((a) => a._id));
    setApps((prev) => prev.filter((a) => !removedIds.has(a._id)));
    const results = await Promise.allSettled(
      toRemove.map((a) => deleteApplication(a.jobId)),
    );
    const restored = toRemove.filter((_, i) => results[i].status === "rejected");
    if (restored.length > 0) {
      setApps((prev) => [...restored, ...prev]);
    }
  }

  async function handleToggleStar(
    appId: string,
    jobId: string,
    next: boolean,
  ) {
    const previous = apps.find((a) => a._id === appId)?.starred ?? false;
    setApps((prev) =>
      prev.map((p) => (p._id === appId ? { ...p, starred: next } : p)),
    );
    try {
      await toggleApplicationStar(jobId, next);
    } catch {
      setApps((prev) =>
        prev.map((p) => (p._id === appId ? { ...p, starred: previous } : p)),
      );
    }
  }

  async function handleCreateInStage(
    title: string,
    company: string,
    stageName: string,
    date: string,
  ) {
    const newApp = await createCustomApplication(title, company, stageName, date);
    setApps((prev) => [newApp, ...prev]);
  }

  async function handleSaveNotes(jobId: string, notes: string) {
    const trimmed = notes.trim();
    const previous = apps.find((a) => a.jobId === jobId);
    setApps((prev) =>
      prev.map((p) =>
        p.jobId === jobId ? { ...p, notes: trimmed || undefined } : p,
      ),
    );
    try {
      await updateApplicationNotes(jobId, trimmed);
    } catch {
      if (previous)
        setApps((prev) =>
          prev.map((p) =>
            p.jobId === jobId ? { ...p, notes: previous.notes } : p,
          ),
        );
    }
  }

  const notesApp = notesAppId
    ? (apps.find((a) => a._id === notesAppId) ?? null)
    : null;

  if (sessionStatus === "unauthenticated") {
    return (
      <Box
        bg="secondary"
        bd="2px solid selected"
        className="rounded-xl p-4 text-sm"
      >
        You&apos;re not signed in.{" "}
        <Link
          className="underline font-semibold"
          href="/sign-in?callbackUrl=%2Fmy-applications"
        >
          Sign in
        </Link>{" "}
        to view and manage your applications across devices.
      </Box>
    );
  }

  const segmentedStyles = {
    root: {
      backgroundColor: "transparent",
      border: "2px solid #3a3a3a",
      borderRadius: "0.65rem",
      padding: 2,
    },
    indicator: {
      backgroundColor: "#3a3a3a",
      borderRadius: "0.45rem",
    },
    label: {
      color: "rgba(255,255,255,0.65)",
      padding: "3px 9px",
      fontWeight: 600,
      fontSize: 12.5,
    },
  } as const;

  const compactSelectStyles = {
    root: { width: 165 },
    input: {
      backgroundColor: "transparent",
      border: "2px solid #3a3a3a",
      borderRadius: "0.65rem",
      color: "rgba(255,255,255,0.75)",
      fontWeight: 500,
      fontSize: 12.5,
      minHeight: 32,
      height: 32,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 32,
      width: 165,
    },
    section: { width: 30 },
    dropdown: {
      backgroundColor: "#2e2e2e",
      border: "2px solid #3a3a3a",
      borderRadius: "0.65rem",
    },
  } as const;

  const compactBtn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.65rem] text-xs font-medium cursor-pointer";
  const compactBtnStyle: React.CSSProperties = {
    background: "transparent",
    border: "2px solid #3a3a3a",
    color: "rgba(255,255,255,0.75)",
    fontFamily: "inherit",
    height: 32,
  };

  return (
    <div className="flex flex-col gap-6">
      {syncMessage && (
        <Box
          bg="secondary"
          bd="2px solid selected"
          className="rounded-xl px-4 py-3 text-sm"
        >
          {syncMessage}
        </Box>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1
            className="font-extrabold text-white"
            style={{
              fontSize: "clamp(28px, 4vw, 36px)",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Applications
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.5)",
              margin: "4px 0 0",
            }}
          >
            {apps.length} tracked across {stages.length} stages
          </p>
        </div>
        <div
          className="flex items-center gap-1.5"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            maxWidth: 320,
          }}
        >
          <IconInfoCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            Jobs you click <strong style={{ color: "rgba(255,255,255,0.7)" }}>Apply</strong> on are auto-added here.
          </span>
        </div>
      </div>

      {view === "kanban" && (
        <ApplicationsStatStrip apps={apps} stages={stages} />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <TextInput
          placeholder="Search company or role…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={14} />}
          styles={{
            input: {
              backgroundColor: "transparent",
              border: "2px solid #3a3a3a",
              borderRadius: "0.65rem",
              color: "white",
              fontSize: 12.5,
              minHeight: 32,
              height: 32,
              paddingTop: 0,
              paddingBottom: 0,
            },
            section: { width: 30 },
          }}
          style={{ flex: "1 1 220px", minWidth: 180, maxWidth: 320 }}
        />

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as ViewMode)}
            data={[
              {
                value: "kanban",
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconLayoutKanban size={14} />
                    <span className="hidden sm:inline">Kanban</span>
                  </Group>
                ),
              },
              {
                value: "timeline",
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconTimeline size={14} />
                    <span className="hidden sm:inline">Timeline</span>
                  </Group>
                ),
              },
            ]}
            styles={segmentedStyles}
          />

          {view === "kanban" && (
            <>
              <Select
                value={sort}
                onChange={(v) => v && setSort(v as KanbanSort)}
                data={[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
                allowDeselect={false}
                leftSection={<IconFilter size={14} />}
                styles={compactSelectStyles}
              />

              <Popover position="bottom-end" shadow="md" withinPortal>
                <Popover.Target>
                  <button className={compactBtn} style={compactBtnStyle}>
                    <IconEye size={14} />
                    <span>Columns</span>
                    <IconChevronDown size={12} />
                  </button>
                </Popover.Target>
                <Popover.Dropdown
                  style={{
                    backgroundColor: "#2e2e2e",
                    border: "2px solid #3a3a3a",
                    borderRadius: "0.65rem",
                  }}
                >
                  <Checkbox.Group
                    value={visibleStages}
                    onChange={setVisibleStages}
                  >
                    <Stack gap="xs">
                      {stages.map((s) => (
                        <Checkbox
                          key={s.id}
                          value={s.name}
                          color="accent"
                          iconColor="#1f1f1f"
                          label={
                            <Group gap="xs" align="center">
                              <StatusDot role={s.colorRole} />
                              <Text size="sm">{s.displayName}</Text>
                            </Group>
                          }
                        />
                      ))}
                    </Stack>
                  </Checkbox.Group>
                </Popover.Dropdown>
              </Popover>
            </>
          )}
        </div>
      </div>

      <NotesModal
        opened={notesApp !== null}
        onClose={() => setNotesAppId(null)}
        initialNotes={notesApp?.notes}
        appTitle={notesApp?.jobSnapshot.title ?? ""}
        appCompany={notesApp?.jobSnapshot.companyName ?? ""}
        onSave={async (notes) => {
          if (notesApp) await handleSaveNotes(notesApp.jobId, notes);
        }}
      />

      {view === "kanban" ? (
        <ApplicationsKanban
          apps={filteredApps}
          stages={stages}
          visibleStageNames={visibleStages}
          sort={sort}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSaveNotes={handleSaveNotes}
          onCreateInStage={handleCreateInStage}
          onToggleStar={handleToggleStar}
          onClearStage={handleClearStage}
        />
      ) : (
        <ApplicationsTimeline
          apps={filteredApps}
          stages={stages}
          onStatusChange={handleStatusChange}
          onOpenNotes={(id) => setNotesAppId(id)}
        />
      )}
    </div>
  );
}
