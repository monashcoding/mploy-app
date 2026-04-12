"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Popover,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  DbApplication,
} from "@/types/application";
import {
  clearLocalApplications,
  getLocalApplications,
} from "@/lib/local-applications";
import {
  createCustomApplication,
  deleteApplication,
  syncLocalApplications,
  updateApplicationStatus,
} from "@/app/my-applications/actions";
import CompanyLogo from "@/components/jobs/company-logo";
import { formatISODate } from "@/lib/utils";

const STATUS_ORDER: ApplicationStatus[] = [
  "STARTED",
  "APPLIED",
  "ACCEPTED",
  "REJECTED",
  "INTERVIEW",
];

function statusPalette(status: ApplicationStatus | string) {
  switch (status) {
    case "STARTED":   return { solid: "#9ca3af", muted: "rgba(156,163,175,0.18)" };
    case "APPLIED":   return { solid: "#60a5fa", muted: "rgba(96,165,250,0.18)" };
    case "INTERVIEW": return { solid: "#ffe22f", muted: "rgba(255,226,47,0.18)" };
    case "ACCEPTED":  return { solid: "#4ade80", muted: "rgba(74,222,128,0.18)" };
    case "REJECTED":  return { solid: "#ff7351", muted: "rgba(255,115,81,0.18)" };
    default:          return { solid: "#9ca3af", muted: "rgba(156,163,175,0.18)" };
  }
}

function capitalize(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function StatusDot({ status }: { status: ApplicationStatus | string }) {
  const { solid } = statusPalette(status);
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: solid,
        flexShrink: 0,
      }}
    />
  );
}

function StatusChip({
  status,
  count,
  small,
}: {
  status: ApplicationStatus;
  count?: number;
  small?: boolean;
}) {
  const { solid, muted } = statusPalette(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: small ? "2px 5px" : "3px 10px",
        borderRadius: 9999,
        backgroundColor: muted,
        fontSize: small ? "0.6rem" : "0.775rem",
        fontWeight: 600,
        color: solid,
        letterSpacing: "0.01em",
        width: small ? "100%" : undefined,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {capitalize(status)}
      {count !== undefined ? `: ${count}` : ""}
    </span>
  );
}

export default function MyApplicationsClient({
  initial,
}: {
  initial: DbApplication[];
}) {
  const { status: sessionStatus } = useSession();
  const [apps, setApps] = useState<DbApplication[]>(initial);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() =>
    STATUS_ORDER.filter(
      (s) => s !== "STARTED" || initial.some((a) => a.status === "STARTED")
    )
  );
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customStatus, setCustomStatus] = useState<ApplicationStatus>("APPLIED");
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    const local = getLocalApplications();
    if (!local.length) return;

    (async () => {
      try {
        const res = await syncLocalApplications(local);
        clearLocalApplications();
        setSyncMessage(
          `Synced ${res.upserted} application${res.upserted === 1 ? "" : "s"} from this device.`
        );
      } catch {
        setSyncMessage(
          "Couldn't sync local applications yet. Try refreshing."
        );
      }
    })();
  }, [sessionStatus]);

  // Auto-untick STARTED when it becomes empty; re-tick when it gets apps again
  useEffect(() => {
    const startedCount = apps.filter((a) => a.status === "STARTED").length;
    setSelectedStatuses((prev) => {
      const has = prev.includes("STARTED");
      if (startedCount === 0 && has) return prev.filter((s) => s !== "STARTED");
      if (startedCount > 0 && !has)
        return STATUS_ORDER.filter((s) => prev.includes(s) || s === "STARTED");
      return prev;
    });
  }, [apps]);

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStatus, DbApplication[]>();
    for (const s of STATUS_ORDER) map.set(s, []);
    for (const a of apps) {
      const group = map.get(a.status);
      if (group) group.push(a);
    }
    return map;
  }, [apps]);

  const total = apps.length;

  async function handleStatusChange(
    appId: string,
    jobId: string,
    oldStatus: ApplicationStatus,
    next: ApplicationStatus
  ) {
    setApps((prev) =>
      prev.map((p) => (p._id === appId ? { ...p, status: next } : p))
    );
    try {
      await updateApplicationStatus(jobId, next);
    } catch {
      setApps((prev) =>
        prev.map((p) => (p._id === appId ? { ...p, status: oldStatus } : p))
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
      const newApp = await createCustomApplication(customTitle.trim(), customCompany.trim(), customStatus, customDate);
      setApps((prev) => [newApp, ...prev]);
      setAddOpen(false);
      setCustomTitle("");
      setCustomCompany("");
      setCustomStatus("APPLIED");
      setCustomDate(new Date().toISOString().slice(0, 10));
    } finally {
      setCustomLoading(false);
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
        <div className="flex items-start justify-between gap-3 sm:block">
          <div>
            <Title order={2} className="font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
              Applications
            </Title>
            {/* Desktop: inline chip row */}
            <div className="hidden sm:flex flex-wrap gap-2 items-center">
              <Text size="xs" c="dimmed" className="mr-1">
                {total} total
              </Text>
              {STATUS_ORDER.map((s) => (
                <StatusChip key={s} status={s} count={grouped.get(s)?.length ?? 0} />
              ))}
            </div>
          </div>

          {/* Mobile: 3+2 grid aligned right */}
          <div className="sm:hidden grid grid-flow-col grid-rows-3 gap-1 shrink-0">
            {STATUS_ORDER.map((s) => (
              <StatusChip key={s} status={s} count={grouped.get(s)?.length ?? 0} small />
            ))}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
            style={{ background: "#ffe22f", border: "none", color: "#1f1f1f", fontFamily: "inherit" }}
            onClick={() => setAddOpen(true)}
          >
            <IconPlus size={13} />
            <span className="hidden sm:inline">Add application</span>
            <span className="sm:hidden">Add</span>
          </button>

        {/* Filter popover */}
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
              Show sections
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
              value={selectedStatuses}
              onChange={setSelectedStatuses}
            >
              <Stack gap="xs">
                {STATUS_ORDER.map((s) => (
                  <Checkbox
                    key={s}
                    value={s}
                    color="accent"
                    iconColor="#1f1f1f"
                    label={
                      <Group gap="xs" align="center">
                        <StatusDot status={s} />
                        <Text size="sm">{capitalize(s)}</Text>
                      </Group>
                    }
                  />
                ))}
              </Stack>
            </Checkbox.Group>
          </Popover.Dropdown>
        </Popover>
        </div>{/* end header actions */}
      </div>

      {/* Add custom application modal */}
      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title={<Text fw={700} size="sm">Add application</Text>}
        styles={{
          content: { backgroundColor: "#2e2e2e", border: "2px solid #3a3a3a", borderRadius: "1rem" },
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
              input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem", color: "white" },
              label: { color: "rgba(255,255,255,0.65)", marginBottom: "0.25rem" },
            }}
          />
          <TextInput
            label="Company"
            placeholder="e.g. Acme Corp"
            value={customCompany}
            onChange={(e) => setCustomCompany(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem", color: "white" },
              label: { color: "rgba(255,255,255,0.65)", marginBottom: "0.25rem" },
            }}
          />
          <Select
            label="Status"
            data={APPLICATION_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))}
            value={customStatus}
            onChange={(v) => v && setCustomStatus(v as ApplicationStatus)}
            leftSection={<StatusDot status={customStatus} />}
            renderOption={({ option }) => (
              <Group gap="xs" align="center">
                <StatusDot status={option.value as ApplicationStatus} />
                <Text size="sm">{option.label}</Text>
              </Group>
            )}
            styles={{
              input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem" },
              dropdown: { backgroundColor: "#2e2e2e", border: "2px solid #3a3a3a", borderRadius: "0.75rem" },
              label: { color: "rgba(255,255,255,0.65)", marginBottom: "0.25rem" },
            }}
          />
          <TextInput
            type="date"
            label="Updated"
            value={customDate}
            onChange={(e) => setCustomDate(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem", color: "white", colorScheme: "dark" } as React.CSSProperties,
              label: { color: "rgba(255,255,255,0.65)", marginBottom: "0.25rem" },
            }}
          />
          <Button
            fullWidth
            loading={customLoading}
            disabled={!customTitle.trim() || !customCompany.trim()}
            onClick={handleCreateCustom}
            style={{ backgroundColor: "#ffe22f", color: "#1f1f1f", borderRadius: "0.75rem", fontWeight: 700, marginTop: "0.25rem" }}
          >
            Add application
          </Button>
        </Stack>
      </Modal>

      {/* Per-status sections */}
      {STATUS_ORDER.filter((s) => selectedStatuses.includes(s)).map(
        (status) => {
          const statusApps = grouped.get(status) ?? [];

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3 pl-1">
                <Title
                  order={5}
                  className="font-bold"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {capitalize(status)}
                </Title>
                <StatusChip status={status} count={statusApps.length} />
              </div>

              {/* Desktop: single Box table — hidden on mobile */}
              <Box
                bg="secondary"
                bd="2px solid selected"
                className="hidden sm:block rounded-xl overflow-hidden"
              >
                {statusApps.length === 0 ? (
                  <div className="py-8 text-center">
                    <Text size="sm" c="dimmed">
                      No {capitalize(status).toLowerCase()} applications
                    </Text>
                  </div>
                ) : (
                  <Table style={{ tableLayout: "fixed", width: "100%" }}>
                    <colgroup>
                      <col style={{ width: "auto" }} />
                      <col style={{ width: "200px" }} />
                      <col style={{ width: "165px" }} />
                      <col style={{ width: "100px" }} />
                      <col style={{ width: "130px" }} />
                    </colgroup>
                    <Table.Thead>
                      <Table.Tr style={{ borderBottom: "2px solid #3a3a3a" }}>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent" }}>
                          Role
                        </Table.Th>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent" }}>
                          Company
                        </Table.Th>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent", textAlign: "left" }}>
                          Status
                        </Table.Th>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent", textAlign: "right" }}>
                          Updated
                        </Table.Th>
                        <Table.Th style={{ padding: "0.75rem 1rem", background: "transparent" }} />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {statusApps.map((a, i) => {
                        const url = a.jobSnapshot.applicationUrl;
                        const isHovered = hoveredRow === a._id;
                        return (
                          <Table.Tr
                            key={a._id}
                            style={{
                              cursor: url ? "pointer" : "default",
                              backgroundColor: isHovered ? "#3a3a3a" : "transparent",
                              transition: "background-color 0.12s ease",
                              borderBottom: i < statusApps.length - 1 ? "1px solid #3a3a3a" : "none",
                            }}
                            onMouseEnter={() => setHoveredRow(a._id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            onClick={() => url && window.open(url, "_blank", "noreferrer")}
                          >
                            <Table.Td style={{ padding: "0.875rem 1rem" }}>
                              <span className="text-sm font-bold line-clamp-2 leading-tight">
                                {a.jobSnapshot.title}
                              </span>
                            </Table.Td>
                            <Table.Td style={{ padding: "0.875rem 1rem" }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <CompanyLogo
                                  name={a.jobSnapshot.companyName}
                                  logo={a.jobSnapshot.logo}
                                  applicationUrl={a.jobSnapshot.applicationUrl}
                                  className="h-7 w-7 flex-shrink-0"
                                />
                                <span className="text-xs line-clamp-1">
                                  {a.jobSnapshot.companyName}
                                </span>
                              </div>
                            </Table.Td>
                            <Table.Td
                              style={{ padding: "0.875rem 1rem", textAlign: "left" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Select
                                data={APPLICATION_STATUSES.map((s) => ({
                                  value: s,
                                  label: capitalize(s),
                                }))}
                                value={a.status}
                                leftSection={<StatusDot status={a.status} />}
                                renderOption={({ option }) => (
                                  <Group gap="xs" align="center">
                                    <StatusDot status={option.value as ApplicationStatus} />
                                    <Text size="sm">{option.label}</Text>
                                  </Group>
                                )}
                                onChange={async (value) => {
                                  if (!value) return;
                                  await handleStatusChange(a._id, a.jobId, a.status, value as ApplicationStatus);
                                }}
                                styles={{
                                  input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem", minWidth: "9rem" },
                                  dropdown: { backgroundColor: "#2e2e2e", border: "2px solid #3a3a3a", borderRadius: "0.75rem", minWidth: "9rem" },
                                }}
                              />
                            </Table.Td>
                            <Table.Td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                              <Text size="xs" c="dimmed">
                                {formatISODate(a.updatedAt)}
                              </Text>
                            </Table.Td>
                            <Table.Td
                              style={{ padding: "0.875rem 1rem" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Group gap="xs" justify="flex-end" wrap="nowrap">
                                {status === "STARTED" && (
                                  <button
                                    className="inline-flex items-center gap-1 text-xs font-bold rounded-xl px-3 py-1.5 cursor-pointer whitespace-nowrap"
                                    style={{ backgroundColor: "#ffe22f", color: "black", border: "none", fontFamily: "inherit" }}
                                    onClick={() => handleStatusChange(a._id, a.jobId, "STARTED", "APPLIED")}
                                  >
                                    Applied <IconCheck size={11} />
                                  </button>
                                )}
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDelete(a._id, a.jobId)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
              </Box>

              {/* Mobile: separate cards — hidden on sm+ */}
              <div className="sm:hidden flex flex-col gap-2">
                {statusApps.length === 0 ? (
                  <Box bg="secondary" bd="2px solid selected" className="rounded-xl py-8 text-center">
                    <Text size="sm" c="dimmed">
                      No {capitalize(status).toLowerCase()} applications
                    </Text>
                  </Box>
                ) : (
                  statusApps.map((a) => {
                    const url = a.jobSnapshot.applicationUrl;
                    return (
                      <Box
                        key={a._id}
                        bg="secondary"
                        bd="2px solid selected"
                        className="rounded-xl p-3"
                        style={{ cursor: url ? "pointer" : "default" }}
                        onClick={() => url && window.open(url, "_blank", "noreferrer")}
                      >
                        {/* Row 1: company + date */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <CompanyLogo
                              name={a.jobSnapshot.companyName}
                              logo={a.jobSnapshot.logo}
                              applicationUrl={a.jobSnapshot.applicationUrl}
                              className="h-6 w-6 flex-shrink-0"
                            />
                            <span className="text-xs line-clamp-1 text-white/70">
                              {a.jobSnapshot.companyName}
                            </span>
                          </div>
                          <Text size="xs" c="dimmed" className="flex-shrink-0 ml-2">
                            {formatISODate(a.updatedAt)}
                          </Text>
                        </div>

                        {/* Row 2: role title */}
                        <div className="text-sm font-bold leading-tight mb-3">
                          {a.jobSnapshot.title}
                        </div>

                        {/* Row 3: status select + actions */}
                        <div
                          className="flex items-center justify-between gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Select
                            data={APPLICATION_STATUSES.map((s) => ({
                              value: s,
                              label: capitalize(s),
                            }))}
                            value={a.status}
                            leftSection={<StatusDot status={a.status} />}
                            renderOption={({ option }) => (
                              <Group gap="xs" align="center">
                                <StatusDot status={option.value as ApplicationStatus} />
                                <Text size="sm">{option.label}</Text>
                              </Group>
                            )}
                            onChange={async (value) => {
                              if (!value) return;
                              await handleStatusChange(a._id, a.jobId, a.status, value as ApplicationStatus);
                            }}
                            styles={{
                              input: { backgroundColor: "#3a3a3a", border: "none", borderRadius: "0.5rem" },
                              dropdown: { backgroundColor: "#2e2e2e", border: "2px solid #3a3a3a", borderRadius: "0.75rem" },
                            }}
                          />
                          <Group gap="xs" wrap="nowrap">
                            {status === "STARTED" && (
                              <button
                                className="inline-flex items-center gap-1 text-xs font-bold rounded-xl px-3 py-1.5 cursor-pointer whitespace-nowrap"
                                style={{ backgroundColor: "#ffe22f", color: "black", border: "none", fontFamily: "inherit" }}
                                onClick={() => handleStatusChange(a._id, a.jobId, "STARTED", "APPLIED")}
                              >
                                Applied <IconCheck size={11} />
                              </button>
                            )}
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(a._id, a.jobId)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </div>
                      </Box>
                    );
                  })
                )}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
