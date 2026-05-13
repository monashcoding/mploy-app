"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Popover,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLayoutKanban,
  IconPlus,
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
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/app/my-applications/actions";
import NotesModal from "@/components/applications/notes-modal";
import ApplicationsKanban, {
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
  const [visibleStages, setVisibleStages] = useState<string[]>(() =>
    stages
      .filter(
        (s) =>
          s.name !== "STARTED" || initial.some((a) => a.status === "STARTED"),
      )
      .map((s) => s.name),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const defaultCustomStatus = useMemo(
    () =>
      stages.find((s) => s.name === "APPLIED")?.name ?? stages[0]?.name ?? "",
    [stages],
  );
  const [customStatus, setCustomStatus] =
    useState<ApplicationStatus>(defaultCustomStatus);
  const [customDate, setCustomDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [customLoading, setCustomLoading] = useState(false);
  const [notesAppId, setNotesAppId] = useState<string | null>(null);

  const stageRoleByName = useMemo(() => {
    const m = new Map<string, StageColorRole>();
    stages.forEach((s) => m.set(s.name, s.colorRole));
    return (name: string) => m.get(name) ?? "neutral";
  }, [stages]);

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

  useEffect(() => {
    const startedCount = apps.filter((a) => a.status === "STARTED").length;
    setVisibleStages((prev) => {
      const has = prev.includes("STARTED");
      if (startedCount === 0 && has) return prev.filter((s) => s !== "STARTED");
      if (startedCount > 0 && !has)
        return stages
          .filter((s) => prev.includes(s.name) || s.name === "STARTED")
          .map((s) => s.name);
      return prev;
    });
  }, [apps, stages]);

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

  async function handleCreateCustom() {
    if (!customTitle.trim() || !customCompany.trim()) return;
    setCustomLoading(true);
    try {
      const newApp = await createCustomApplication(
        customTitle.trim(),
        customCompany.trim(),
        customStatus,
        customDate,
      );
      setApps((prev) => [newApp, ...prev]);
      setAddOpen(false);
      setCustomTitle("");
      setCustomCompany("");
      setCustomStatus(defaultCustomStatus);
      setCustomDate(new Date().toISOString().slice(0, 10));
    } finally {
      setCustomLoading(false);
    }
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

        <div className="flex items-center gap-2 flex-wrap">
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
            styles={{
              root: {
                backgroundColor: "transparent",
                border: "2px solid #3a3a3a",
                borderRadius: "0.75rem",
                padding: 2,
              },
              indicator: {
                backgroundColor: "#3a3a3a",
                borderRadius: "0.5rem",
              },
              label: {
                color: "rgba(255,255,255,0.65)",
                padding: "4px 10px",
                fontWeight: 600,
                fontSize: 12.5,
              },
            }}
          />

          <button
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
            style={{
              background: "#ffe22f",
              border: "none",
              color: "#1f1f1f",
              fontFamily: "inherit",
            }}
            onClick={() => setAddOpen(true)}
          >
            <IconPlus size={13} />
            <span className="hidden sm:inline">Add application</span>
            <span className="sm:hidden">Add</span>
          </button>

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
                styles={{
                  input: {
                    backgroundColor: "transparent",
                    border: "2px solid #3a3a3a",
                    borderRadius: "0.75rem",
                    color: "rgba(255,255,255,0.65)",
                    fontWeight: 500,
                    fontSize: 13,
                    minHeight: 36,
                    height: 36,
                    paddingTop: 0,
                    paddingBottom: 0,
                    minWidth: 140,
                  },
                  dropdown: {
                    backgroundColor: "#2e2e2e",
                    border: "2px solid #3a3a3a",
                    borderRadius: "0.75rem",
                  },
                }}
              />

              <Popover position="bottom-end" shadow="md" withinPortal>
                <Popover.Target>
                  <button
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
                    style={{
                      background: "transparent",
                      border: "2px solid #3a3a3a",
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "inherit",
                    }}
                  >
                    Columns
                    <IconChevronDown size={14} />
                  </button>
                </Popover.Target>
                <Popover.Dropdown
                  style={{
                    backgroundColor: "#2e2e2e",
                    border: "2px solid #3a3a3a",
                    borderRadius: "0.75rem",
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

      {/* Add custom application modal */}
      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title={
          <Text fw={700} size="sm">
            Add application
          </Text>
        }
        styles={{
          content: {
            backgroundColor: "#2e2e2e",
            border: "2px solid #3a3a3a",
            borderRadius: "1rem",
          },
          header: { backgroundColor: "#2e2e2e" },
          overlay: { backdropFilter: "blur(2px)" },
        }}
      >
        <Stack gap="sm">
          <TextInput
            label="Role"
            placeholder="e.g. Software Engineer"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: "#3a3a3a",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
              },
              label: {
                color: "rgba(255,255,255,0.65)",
                marginBottom: "0.25rem",
              },
            }}
          />
          <TextInput
            label="Company"
            placeholder="e.g. Acme Corp"
            value={customCompany}
            onChange={(e) => setCustomCompany(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: "#3a3a3a",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
              },
              label: {
                color: "rgba(255,255,255,0.65)",
                marginBottom: "0.25rem",
              },
            }}
          />
          <Select
            label="Status"
            data={stages.map((s) => ({
              value: s.name,
              label: s.displayName,
            }))}
            value={customStatus}
            onChange={(v) => v && setCustomStatus(v as ApplicationStatus)}
            leftSection={<StatusDot role={stageRoleByName(customStatus)} />}
            renderOption={({ option }) => (
              <Group gap="xs" align="center">
                <StatusDot role={stageRoleByName(option.value)} />
                <Text size="sm">{option.label}</Text>
              </Group>
            )}
            styles={{
              input: {
                backgroundColor: "#3a3a3a",
                border: "none",
                borderRadius: "0.5rem",
              },
              dropdown: {
                backgroundColor: "#2e2e2e",
                border: "2px solid #3a3a3a",
                borderRadius: "0.75rem",
              },
              label: {
                color: "rgba(255,255,255,0.65)",
                marginBottom: "0.25rem",
              },
            }}
          />
          <TextInput
            type="date"
            label="Updated"
            value={customDate}
            onChange={(e) => setCustomDate(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: "#3a3a3a",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                colorScheme: "dark",
              } as React.CSSProperties,
              label: {
                color: "rgba(255,255,255,0.65)",
                marginBottom: "0.25rem",
              },
            }}
          />
          <Button
            fullWidth
            loading={customLoading}
            disabled={!customTitle.trim() || !customCompany.trim()}
            onClick={handleCreateCustom}
            style={{
              backgroundColor: "#ffe22f",
              color: "#1f1f1f",
              borderRadius: "0.75rem",
              fontWeight: 700,
              marginTop: "0.25rem",
            }}
          >
            Add application
          </Button>
        </Stack>
      </Modal>

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
          apps={apps}
          stages={stages}
          visibleStageNames={visibleStages}
          sort={sort}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onOpenNotes={(id) => setNotesAppId(id)}
        />
      ) : (
        <ApplicationsTimeline
          apps={apps}
          stages={stages}
          onStatusChange={handleStatusChange}
          onOpenNotes={(id) => setNotesAppId(id)}
        />
      )}
    </div>
  );
}
