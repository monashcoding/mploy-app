"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
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
  IconCheck,
  IconChevronDown,
  IconEye,
  IconFilter,
  IconInfoCircle,
  IconLayoutList,
  IconLayoutCards,
  IconPlus,
  IconSearch,
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
import ApplicationsKanban, {
  ApplicationsStatStrip,
  KanbanDensity,
  KanbanSort,
} from "@/components/applications/applications-kanban";
import ApplicationDatePicker, {
  formatApplicationDateValue,
} from "@/components/applications/application-date-picker";
import { rolePalette } from "@/lib/role-palette";

const SORT_STORAGE_KEY = "mp:apps:kanban-sort:v1";
const DENSITY_STORAGE_KEY = "mp:apps:kanban-density:v1";
const STAGE_ORDER_STORAGE_KEY = "mp:apps:stage-order:v1";
const MAC_YELLOW = "#ffe22f";

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

function readDensity(): KanbanDensity {
  if (typeof window === "undefined") return "detailed";
  try {
    const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    if (raw === "compact" || raw === "detailed") return raw;
  } catch {
    // ignore
  }
  return "detailed";
}

function orderStages(stages: UserStage[], orderedNames: string[]) {
  const byName = new Map(stages.map((stage) => [stage.name, stage]));
  const ordered = orderedNames
    .map((name) => byName.get(name))
    .filter((stage): stage is UserStage => Boolean(stage));
  const missing = stages.filter((stage) => !orderedNames.includes(stage.name));

  return [...ordered, ...missing].map((stage, order) => ({
    ...stage,
    order,
  }));
}

function readStageOrder(stages: UserStage[]) {
  if (typeof window === "undefined") return stages;
  try {
    const raw = window.localStorage.getItem(STAGE_ORDER_STORAGE_KEY);
    const order = raw ? JSON.parse(raw) : null;
    if (Array.isArray(order) && order.every((name) => typeof name === "string")) {
      return orderStages(stages, order);
    }
  } catch {
    // ignore
  }
  return stages;
}

function moveStage(stages: UserStage[], activeName: string, targetName: string) {
  const from = stages.findIndex((stage) => stage.name === activeName);
  const to = stages.findIndex((stage) => stage.name === targetName);
  if (from < 0 || to < 0 || from === to) return stages;

  const next = [...stages];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((stage, order) => ({ ...stage, order }));
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
  const [stages, setStages] = useState<UserStage[]>(() =>
    readStageOrder(initialStages),
  );
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<KanbanSort>(readSort);
  const [density, setDensity] = useState<KanbanDensity>(readDensity);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleStages, setVisibleStages] = useState<string[]>(() =>
    stages.map((s) => s.name),
  );
  const [customAddOpen, setCustomAddOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customStage, setCustomStage] = useState(stages[0]?.name ?? "");
  const [customDate, setCustomDate] = useState(formatApplicationDateValue);
  const [customCreating, setCustomCreating] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SORT_STORAGE_KEY, sort);
    } catch {
      // ignore
    }
  }, [sort]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
    } catch {
      // ignore
    }
  }, [density]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STAGE_ORDER_STORAGE_KEY,
        JSON.stringify(stages.map((stage) => stage.name)),
      );
    } catch {
      // ignore
    }
  }, [stages]);

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

  const stageOptions = stages.map((s) => ({
    value: s.name,
    label: s.displayName,
  }));

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

  function resetCustomAdd() {
    setCustomTitle("");
    setCustomCompany("");
    setCustomStage(stages[0]?.name ?? "");
    setCustomDate(formatApplicationDateValue());
  }

  async function submitCustomAdd() {
    if (!customTitle.trim() || !customCompany.trim() || !customStage) return;
    setCustomCreating(true);
    try {
      await handleCreateInStage(
        customTitle.trim(),
        customCompany.trim(),
        customStage,
        customDate,
      );
      resetCustomAdd();
      setCustomAddOpen(false);
    } finally {
      setCustomCreating(false);
    }
  }

  async function handleSaveNotes(jobId: string, notes: string) {
    const nextNotes = notes.trim().length > 0 ? notes : "";
    const previous = apps.find((a) => a.jobId === jobId);
    setApps((prev) =>
      prev.map((p) =>
        p.jobId === jobId ? { ...p, notes: nextNotes || undefined } : p,
      ),
    );
    try {
      await updateApplicationNotes(jobId, nextNotes);
    } catch {
      if (previous)
        setApps((prev) =>
          prev.map((p) =>
            p.jobId === jobId ? { ...p, notes: previous.notes } : p,
          ),
        );
    }
  }

  function handleStageReorder(activeStageName: string, targetStageName: string) {
    setStages((prev) => moveStage(prev, activeStageName, targetStageName));
  }

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

      <ApplicationsStatStrip apps={apps} stages={stages} />

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

        <Popover
          opened={customAddOpen}
          onChange={setCustomAddOpen}
          position="bottom-start"
          shadow="md"
          withinPortal
          trapFocus
        >
          <Popover.Target>
            <button
              type="button"
              className="apps-custom-add-btn"
              onClick={() => setCustomAddOpen((o) => !o)}
            >
              <IconPlus size={14} />
              <span>Add Custom</span>
            </button>
          </Popover.Target>
          <Popover.Dropdown
            style={{
              backgroundColor: "#2e2e2e",
              border: "2px solid #3a3a3a",
              borderRadius: "0.65rem",
              padding: 12,
              width: 280,
            }}
          >
            <Stack gap="xs">
              <TextInput
                size="xs"
                placeholder="Role"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                }}
              />
              <TextInput
                size="xs"
                placeholder="Company"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                }}
              />
              <Select
                size="xs"
                value={customStage}
                onChange={(value) => value && setCustomStage(value)}
                data={stageOptions}
                allowDeselect={false}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                  dropdown: {
                    backgroundColor: "#2e2e2e",
                    border: "2px solid #3a3a3a",
                    borderRadius: "0.65rem",
                  },
                }}
              />
              <ApplicationDatePicker
                value={customDate}
                onChange={setCustomDate}
                ariaLabel="Application date for custom application"
              />
              <Button
                size="xs"
                fullWidth
                loading={customCreating}
                disabled={
                  !customTitle.trim() || !customCompany.trim() || !customStage
                }
                onClick={submitCustomAdd}
                style={{
                  backgroundColor: MAC_YELLOW,
                  color: "#1f1f1f",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                }}
              >
                Add Custom
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <SegmentedControl
            value={density}
            onChange={(v) => setDensity(v as KanbanDensity)}
            data={[
              {
                value: "compact",
                label: (
                  <Group
                    gap={6}
                    wrap="nowrap"
                    style={{
                      color:
                        density === "compact" ? MAC_YELLOW : "currentColor",
                    }}
                  >
                    <IconLayoutList size={14} />
                    <span className="hidden sm:inline">Compact</span>
                  </Group>
                ),
              },
              {
                value: "detailed",
                label: (
                  <Group
                    gap={6}
                    wrap="nowrap"
                    style={{
                      color:
                        density === "detailed" ? MAC_YELLOW : "currentColor",
                    }}
                  >
                    <IconLayoutCards size={14} />
                    <span className="hidden sm:inline">Detailed</span>
                  </Group>
                ),
              },
            ]}
            styles={segmentedStyles}
          />

          <Select
            value={sort}
            onChange={(v) => v && setSort(v as KanbanSort)}
            data={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
            allowDeselect={false}
            withCheckIcon={false}
            renderOption={({ option, checked }) => (
              <Group justify="space-between" wrap="nowrap" w="100%">
                <span>{option.label}</span>
                {checked && <IconCheck size={14} color={MAC_YELLOW} />}
              </Group>
            )}
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
              <Checkbox.Group value={visibleStages} onChange={setVisibleStages}>
                <Stack gap="xs">
                  {stages.map((s) => (
                    <Checkbox
                      key={s.id}
                      value={s.name}
                      color="#3a3a3a"
                      iconColor={MAC_YELLOW}
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
        </div>
      </div>

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
        onStageReorder={handleStageReorder}
        density={density}
      />
    </div>
  );
}
