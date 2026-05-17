"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  IconCheck,
  IconChevronDown,
  IconEdit,
  IconEye,
  IconFilter,
  IconInfoCircle,
  IconLayoutList,
  IconLayoutCards,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import {
  ApplicationStatus,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
  StageColorRole,
  UserStage,
} from "@/types/application";
import {
  clearLocalApplications,
  getLocalApplications,
} from "@/lib/local-applications";
import {
  createRecruitmentCycle,
  createCustomApplication,
  deleteRecruitmentCycle,
  deleteApplication,
  renameRecruitmentCycle,
  restoreDeletedApplication,
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
const DELETE_CARD_FADE_MS = 220;
const ACCEPTED_CELEBRATION_MS = 2000;

type AcceptedCelebration = {
  id: number;
  stageName: string;
};

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
    if (
      Array.isArray(order) &&
      order.every((name) => typeof name === "string")
    ) {
      return orderStages(stages, order);
    }
  } catch {
    // ignore
  }
  return stages;
}

function moveStage(
  stages: UserStage[],
  activeName: string,
  targetName: string,
) {
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
  initialCycles,
}: {
  initial: DbApplication[];
  initialStages: UserStage[];
  initialCycles: RecruitmentCycle[];
}) {
  const { status: sessionStatus } = useSession();
  const [apps, setApps] = useState<DbApplication[]>(initial);
  const [stages, setStages] = useState<UserStage[]>(() =>
    readStageOrder(initialStages),
  );
  const [cycles, setCycles] = useState<RecruitmentCycle[]>(initialCycles);
  const [selectedCycleId, setSelectedCycleId] = useState(
    initialCycles[0]?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID,
  );
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<KanbanSort>(readSort);
  const [density, setDensity] = useState<KanbanDensity>(readDensity);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleStages, setVisibleStages] = useState<string[]>(() =>
    stages.map((s) => s.name),
  );
  const [mobileStageName, setMobileStageName] = useState(stages[0]?.name ?? "");
  const [customAddOpen, setCustomAddOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customStage, setCustomStage] = useState(stages[0]?.name ?? "");
  const [customDate, setCustomDate] = useState(formatApplicationDateValue);
  const [customCreating, setCustomCreating] = useState(false);
  const [cycleMenuOpen, setCycleMenuOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [renamingCycleId, setRenamingCycleId] = useState<string | null>(null);
  const [renameCycleName, setRenameCycleName] = useState("");
  const [cycleDeleteTarget, setCycleDeleteTarget] =
    useState<RecruitmentCycle | null>(null);
  const [deletingCycle, setDeletingCycle] = useState(false);
  const [acceptedCelebration, setAcceptedCelebration] =
    useState<AcceptedCelebration | null>(null);
  const acceptedCelebrationIdRef = useRef(0);
  const acceptedCelebrationTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

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

  useEffect(
    () => () => {
      if (acceptedCelebrationTimerRef.current) {
        clearTimeout(acceptedCelebrationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (cycles.some((cycle) => cycle.id === selectedCycleId)) return;
    setSelectedCycleId(cycles[0]?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID);
  }, [cycles, selectedCycleId]);

  useEffect(() => {
    if (stages.length === 0) {
      setMobileStageName("");
      return;
    }
    if (stages.some((stage) => stage.name === mobileStageName)) {
      return;
    }
    setMobileStageName(stages[0].name);
  }, [mobileStageName, stages]);

  const selectedCycle = useMemo(
    () =>
      cycles.find((cycle) => cycle.id === selectedCycleId) ??
      cycles[0] ?? {
        id: DEFAULT_RECRUITMENT_CYCLE_ID,
        name: "Current cycle",
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
    [cycles, selectedCycleId],
  );

  const currentCycle =
    cycles.find((cycle) => cycle.id === DEFAULT_RECRUITMENT_CYCLE_ID) ??
    cycles[0];

  const cycleApps = useMemo(
    () =>
      apps.filter(
        (app) =>
          (app.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID) === selectedCycle.id,
      ),
    [apps, selectedCycle.id],
  );

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cycleApps;
    return cycleApps.filter(
      (a) =>
        a.jobSnapshot.companyName.toLowerCase().includes(q) ||
        a.jobSnapshot.title.toLowerCase().includes(q),
    );
  }, [cycleApps, searchQuery]);

  function isWinStatus(status: ApplicationStatus) {
    return (
      status === "ACCEPTED" ||
      stages.find((stage) => stage.name === status)?.colorRole === "win"
    );
  }

  function showAcceptedCelebration(stageName: string) {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    acceptedCelebrationIdRef.current += 1;
    setAcceptedCelebration({
      id: acceptedCelebrationIdRef.current,
      stageName,
    });

    if (acceptedCelebrationTimerRef.current) {
      clearTimeout(acceptedCelebrationTimerRef.current);
    }
    acceptedCelebrationTimerRef.current = setTimeout(() => {
      setAcceptedCelebration(null);
      acceptedCelebrationTimerRef.current = null;
    }, ACCEPTED_CELEBRATION_MS);
  }

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
      if (!isWinStatus(oldStatus) && isWinStatus(next)) {
        showAcceptedCelebration(next);
      }
    } catch (error) {
      setApps((prev) =>
        prev.map((p) => (p._id === appId ? { ...p, status: oldStatus } : p)),
      );
      throw error;
    }
  }

  async function handleDelete(appId: string, jobId: string) {
    const removed = apps.find((a) => a._id === appId);
    if (!removed) throw new Error("Application not found");

    const fadePromise = new Promise<"fade">((resolve) => {
      window.setTimeout(() => resolve("fade"), DELETE_CARD_FADE_MS);
    });
    const deleteResultPromise = deleteApplication(jobId).then(
      () => ({ status: "deleted" as const }),
      (error) => ({ status: "failed" as const, error }),
    );

    try {
      const firstResult = await Promise.race([
        fadePromise,
        deleteResultPromise,
      ]);

      if (firstResult !== "fade" && firstResult.status === "failed") {
        throw firstResult.error;
      }

      await fadePromise;
      setApps((prev) => prev.filter((a) => a._id !== appId));

      const deleteResult =
        firstResult === "fade" ? await deleteResultPromise : firstResult;

      if (deleteResult.status === "failed") {
        setApps((prev) =>
          prev.some((app) => app._id === removed._id)
            ? prev
            : [removed, ...prev],
        );
        throw deleteResult.error;
      }

      const notificationId = `deleted-application-${removed._id}`;
      notifications.show({
        id: notificationId,
        position: "top-right",
        autoClose: 7000,
        withCloseButton: true,
        color: "accent",
        message: (
          <Group gap="sm" justify="space-between" wrap="nowrap">
            <Text size="sm" c="white" lineClamp={1}>
              Deleted{" "}
              <span style={{ color: MAC_YELLOW, fontWeight: 700 }}>
                {removed.jobSnapshot.title}
              </span>{" "}
              at{" "}
              <span style={{ color: MAC_YELLOW, fontWeight: 700 }}>
                {removed.jobSnapshot.companyName}
              </span>
            </Text>
            <Button
              size="xs"
              variant="subtle"
              color="accent"
              onClick={async () => {
                notifications.hide(notificationId);
                setApps((prev) =>
                  prev.some((app) => app.jobId === removed.jobId)
                    ? prev
                    : [removed, ...prev],
                );

                try {
                  const restored = await restoreDeletedApplication(removed);
                  setApps((prev) =>
                    prev.map((app) =>
                      app.jobId === restored.jobId ? restored : app,
                    ),
                  );
                } catch {
                  setApps((prev) =>
                    prev.filter((app) => app.jobId !== removed.jobId),
                  );
                  notifications.show({
                    position: "top-right",
                    autoClose: 3000,
                    color: "red",
                    message: "Couldn't undo delete. Try refreshing.",
                  });
                }
              }}
            >
              Undo
            </Button>
          </Group>
        ),
      });
    } catch (error) {
      notifications.show({
        position: "top-right",
        autoClose: 3000,
        color: "red",
        message: "Couldn't delete application. Try again.",
      });
      throw error;
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
    const restored = toRemove.filter(
      (_, i) => results[i].status === "rejected",
    );
    if (restored.length > 0) {
      setApps((prev) => [...restored, ...prev]);
    }
  }

  async function handleToggleStar(appId: string, jobId: string, next: boolean) {
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
    const newApp = await createCustomApplication(
      title,
      company,
      stageName,
      date,
      selectedCycle.id,
    );
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

  function handleStageReorder(
    activeStageName: string,
    targetStageName: string,
  ) {
    setStages((prev) => moveStage(prev, activeStageName, targetStageName));
  }

  async function submitNewCycle() {
    const trimmed = newCycleName.trim();
    if (!trimmed) return;

    setCreatingCycle(true);
    try {
      const cycle = await createRecruitmentCycle(trimmed);
      setCycles((prev) => [...prev, cycle]);
      setSelectedCycleId(cycle.id);
      setNewCycleName("");
    } finally {
      setCreatingCycle(false);
    }
  }

  function startRenameCycle(cycle: RecruitmentCycle) {
    setRenamingCycleId(cycle.id);
    setRenameCycleName(cycle.name);
  }

  async function submitRenameCycle(cycleId: string) {
    const trimmed = renameCycleName.trim();
    if (!trimmed) return;

    const previous = cycles;
    setCycles((prev) =>
      prev.map((cycle) =>
        cycle.id === cycleId ? { ...cycle, name: trimmed } : cycle,
      ),
    );
    setRenamingCycleId(null);
    try {
      const renamed = await renameRecruitmentCycle(cycleId, trimmed);
      setCycles((prev) =>
        prev.map((cycle) => (cycle.id === cycleId ? renamed : cycle)),
      );
    } catch {
      setCycles(previous);
    }
  }

  async function confirmDeleteCycle() {
    if (!cycleDeleteTarget) return;
    const target = cycleDeleteTarget;
    const fallbackCycleId = currentCycle?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID;
    const previousCycles = cycles;
    const previousApps = apps;

    setDeletingCycle(true);
    setCycleDeleteTarget(null);
    setCycles((prev) => prev.filter((cycle) => cycle.id !== target.id));
    setSelectedCycleId(fallbackCycleId);
    setApps((prev) =>
      prev.map((app) =>
        (app.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID) === target.id
          ? { ...app, cycleId: fallbackCycleId }
          : app,
      ),
    );

    try {
      await deleteRecruitmentCycle(target.id);
    } catch {
      setCycles(previousCycles);
      setApps(previousApps);
      setSelectedCycleId(target.id);
    } finally {
      setDeletingCycle(false);
    }
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
    root: { width: 145 },
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
      width: 145,
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
      <Modal
        opened={Boolean(cycleDeleteTarget)}
        onClose={() => setCycleDeleteTarget(null)}
        title="Delete recruitment cycle?"
        centered
      >
        <Text size="sm" c="dimmed">
          Applications in{" "}
          <strong style={{ color: "white" }}>{cycleDeleteTarget?.name}</strong>{" "}
          will move to{" "}
          <strong style={{ color: "white" }}>
            {currentCycle?.name ?? "Current cycle"}
          </strong>
          .
        </Text>
        <Group justify="flex-end" gap="xs" mt="lg">
          <Button
            variant="default"
            size="xs"
            onClick={() => setCycleDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            loading={deletingCycle}
            onClick={confirmDeleteCycle}
          >
            Delete
          </Button>
        </Group>
      </Modal>

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
            {cycleApps.length} tracked in {selectedCycle.name}
          </p>
        </div>
        <div
          className="apps-auto-added-note flex items-center gap-1.5"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            maxWidth: 320,
          }}
        >
          <IconInfoCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            Jobs you click{" "}
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Apply</strong> on
            are auto-added
          </span>
        </div>
      </div>

      <ApplicationsStatStrip apps={cycleApps} stages={stages} />

      {/* Toolbar */}
      <div className="apps-toolbar flex items-center gap-2 flex-wrap">
        <TextInput
          className="apps-toolbar-search"
          placeholder="Search"
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
          style={{ flex: "0 1 180px", minWidth: 155, maxWidth: 205 }}
        />

        <Popover
          opened={cycleMenuOpen}
          onChange={setCycleMenuOpen}
          position="bottom-start"
          shadow="md"
          withinPortal
        >
          <Popover.Target>
            <button
              type="button"
              className="apps-cycle-trigger"
              onClick={() => setCycleMenuOpen((open) => !open)}
            >
              <span>{selectedCycle.name}</span>
              <IconChevronDown size={13} />
            </button>
          </Popover.Target>
          <Popover.Dropdown className="apps-cycle-menu">
            <div className="apps-cycle-list">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="apps-cycle-row">
                  {renamingCycleId === cycle.id ? (
                    <div className="apps-cycle-edit">
                      <TextInput
                        size="xs"
                        value={renameCycleName}
                        autoFocus
                        onChange={(e) =>
                          setRenameCycleName(e.currentTarget.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void submitRenameCycle(cycle.id);
                          }
                          if (e.key === "Escape") {
                            setRenamingCycleId(null);
                          }
                        }}
                        styles={{
                          input: {
                            backgroundColor: "#3a3a3a",
                            border: "none",
                            borderRadius: "0.4rem",
                            color: "white",
                          },
                        }}
                      />
                      <Button
                        size="xs"
                        disabled={!renameCycleName.trim()}
                        onClick={() => void submitRenameCycle(cycle.id)}
                        style={{
                          backgroundColor: MAC_YELLOW,
                          color: "#1f1f1f",
                          fontWeight: 800,
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={
                          "apps-cycle-select" +
                          (cycle.id === selectedCycle.id ? " is-selected" : "")
                        }
                        onClick={() => {
                          setSelectedCycleId(cycle.id);
                          setCycleMenuOpen(false);
                        }}
                      >
                        <span>{cycle.name}</span>
                        {cycle.id === selectedCycle.id && (
                          <IconCheck size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        className="apps-cycle-action"
                        aria-label={`Rename ${cycle.name}`}
                        title={`Rename ${cycle.name}`}
                        onClick={() => startRenameCycle(cycle)}
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        type="button"
                        className="apps-cycle-action"
                        aria-label={`Delete ${cycle.name}`}
                        title={
                          cycle.id === DEFAULT_RECRUITMENT_CYCLE_ID
                            ? "Current cycle cannot be deleted"
                            : `Delete ${cycle.name}`
                        }
                        disabled={cycle.id === DEFAULT_RECRUITMENT_CYCLE_ID}
                        onClick={() => {
                          setCycleMenuOpen(false);
                          setCycleDeleteTarget(cycle);
                        }}
                      >
                        <IconTrash size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="apps-cycle-add">
              <TextInput
                size="xs"
                placeholder="Add new recruitment cycle"
                value={newCycleName}
                onChange={(e) => setNewCycleName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitNewCycle();
                }}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                }}
              />
              <Button
                size="xs"
                loading={creatingCycle}
                disabled={!newCycleName.trim()}
                onClick={() => void submitNewCycle()}
                style={{
                  backgroundColor: MAC_YELLOW,
                  color: "#1f1f1f",
                  borderRadius: "0.45rem",
                  fontWeight: 800,
                }}
              >
                Add
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>

        <div className="apps-toolbar-actions flex items-center gap-2 flex-wrap ml-auto">
          <SegmentedControl
            className="apps-view-toggle"
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

          <Popover position="bottom-end" shadow="md" withinPortal>
            <Popover.Target>
              <button
                className={`${compactBtn} apps-columns-trigger`}
                style={compactBtnStyle}
              >
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

          <Select
            className="apps-sort-select"
            value={sort}
            onChange={(v) => v && setSort(v as KanbanSort)}
            data={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ]}
            allowDeselect={false}
            withCheckIcon={false}
            renderOption={({ option, checked }) => (
              <Group justify="space-between" wrap="nowrap" w="100%">
                <span>
                  {option.value === "newest" ? "Newest first" : "Oldest first"}
                </span>
                {checked && <IconCheck size={14} color={MAC_YELLOW} />}
              </Group>
            )}
            leftSection={<IconFilter size={14} />}
            styles={compactSelectStyles}
          />

          <Popover
            opened={customAddOpen}
            onChange={setCustomAddOpen}
            position="bottom-end"
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
        mobileStageName={mobileStageName}
        onMobileStageChange={setMobileStageName}
        acceptedCelebration={acceptedCelebration}
      />
    </div>
  );
}
