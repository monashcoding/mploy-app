"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  Popover,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
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
  deleteApplication,
  syncLocalApplications,
  updateApplicationStatus,
} from "@/app/my-applications/actions";
import CompanyLogo from "@/components/jobs/company-logo";

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
}: {
  status: ApplicationStatus;
  count?: number;
}) {
  const { solid, muted } = statusPalette(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 9999,
        backgroundColor: muted,
        fontSize: "0.775rem",
        fontWeight: 600,
        color: solid,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: solid,
          flexShrink: 0,
        }}
      />
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    STATUS_ORDER as string[]
  );
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Title order={2} className="font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
            My Applications
          </Title>
          <div className="flex flex-wrap gap-2 items-center">
            <Text size="xs" c="dimmed" className="mr-1">
              {total} total
            </Text>
            {STATUS_ORDER.map((s) => (
              <StatusChip
                key={s}
                status={s}
                count={grouped.get(s)?.length ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Filter popover */}
        <Popover position="bottom-end" shadow="md" withinPortal>
          <Popover.Target>
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
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
                    color="yellow"
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
      </div>

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

              <Box
                bg="secondary"
                bd="2px solid selected"
                className="rounded-xl overflow-hidden"
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
                      <col style={{ width: "auto" }} />          {/* Role — fills remaining space */}
                      <col style={{ width: "200px" }} />         {/* Company */}
                      <col style={{ width: "165px" }} />         {/* Status */}
                      <col style={{ width: "100px" }} />         {/* Updated */}
                      <col style={{ width: "130px" }} />         {/* Actions */}
                    </colgroup>
                    <Table.Thead>
                      <Table.Tr style={{ borderBottom: "2px solid #3a3a3a" }}>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent" }}>
                          Role
                        </Table.Th>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent" }}>
                          Company
                        </Table.Th>
                        <Table.Th className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", padding: "0.75rem 1rem", background: "transparent", textAlign: "right" }}>
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
                            {/* Role */}
                            <Table.Td style={{ padding: "0.875rem 1rem" }}>
                              <span className="text-sm font-bold line-clamp-2 leading-tight">
                                {a.jobSnapshot.title}
                              </span>
                            </Table.Td>

                            {/* Company with logo */}
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

                            {/* Status select */}
                            <Table.Td
                              style={{ padding: "0.875rem 1rem", textAlign: "right" }}
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
                                }}
                              />
                            </Table.Td>

                            {/* Updated date */}
                            <Table.Td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                              <Text size="xs" c="dimmed">
                                {new Date(a.updatedAt).toLocaleDateString()}
                              </Text>
                            </Table.Td>

                            {/* Actions */}
                            <Table.Td
                              style={{ padding: "0.875rem 1rem" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Group gap="xs" justify="flex-end" wrap="nowrap">
                                {status === "STARTED" && (
                                  <button
                                    className="text-xs font-bold rounded-xl px-3 py-1.5 cursor-pointer"
                                    style={{
                                      backgroundColor: "#ffe22f",
                                      color: "black",
                                      border: "none",
                                      fontFamily: "inherit",
                                    }}
                                    onClick={() =>
                                      handleStatusChange(a._id, a.jobId, "STARTED", "APPLIED")
                                    }
                                  >
                                    Mark Applied
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
            </div>
          );
        }
      )}
    </div>
  );
}
