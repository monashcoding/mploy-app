"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ActionIcon,
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

const DS = {
  surface: "#1a1a1a",
  surfaceHigh: "#20201f",
  primary: "#ffdd73",
  onPrimary: "#624e00",
};

const STATUS_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "ACCEPTED",
  "REJECTED",
  "INTERVIEW",
  "STARTED",
];

function statusPalette(status: ApplicationStatus | string) {
  switch (status) {
    case "STARTED":   return { solid: "#9ca3af", muted: "rgba(156,163,175,0.18)" };
    case "APPLIED":   return { solid: "#60a5fa", muted: "rgba(96,165,250,0.18)" };
    case "INTERVIEW": return { solid: "#ffdd73", muted: "rgba(255,221,115,0.18)" };
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
      <div
        style={{
          padding: "1rem 1.5rem",
          borderRadius: "0.75rem",
          backgroundColor: "rgba(255,221,115,0.08)",
          color: DS.primary,
          fontSize: "0.875rem",
        }}
      >
        You&apos;re not signed in.{" "}
        <Link
          style={{ textDecoration: "underline", fontWeight: 600 }}
          href="/sign-in?callbackUrl=%2Fmy-applications"
        >
          Sign in
        </Link>{" "}
        to view and manage your applications across devices.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {syncMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(74,222,128,0.08)",
            color: "#4ade80",
            fontSize: "0.875rem",
          }}
        >
          {syncMessage}
        </div>
      )}

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <Title
            order={2}
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            My Applications
          </Title>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.35)",
                marginRight: "0.25rem",
              }}
            >
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

        {/* Filter popover — ghost/secondary style */}
        <Popover position="bottom-end" shadow="md" withinPortal>
          <Popover.Target>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.65)",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Show sections
              <IconChevronDown size={14} />
            </button>
          </Popover.Target>
          <Popover.Dropdown
            style={{
              backgroundColor: DS.surfaceHigh,
              border: "1px solid rgba(255,255,255,0.08)",
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
                        <Text size="sm" c="white">
                          {capitalize(s)}
                        </Text>
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
              {/* Section header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "0.875rem",
                  paddingLeft: "0.125rem",
                }}
              >
                <Title
                  order={4}
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {capitalize(status)}
                </Title>
                <StatusChip status={status} count={statusApps.length} />
              </div>

              {/* Cards container */}
              <div
                style={{
                  borderRadius: "0.875rem",
                  backgroundColor: DS.surface,
                  overflow: "hidden",
                }}
              >
                {statusApps.length === 0 ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.2)",
                        fontSize: "0.875rem",
                      }}
                    >
                      No {capitalize(status).toLowerCase()} applications
                    </Text>
                  </div>
                ) : (
                  <Table>
                    <Table.Thead>
                      <Table.Tr
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {["Role", "Company", "Status", "Updated"].map(
                          (col) => (
                            <Table.Th
                              key={col}
                              style={{
                                color: "rgba(255,255,255,0.3)",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                letterSpacing: "0.07em",
                                textTransform: "uppercase",
                                padding: "0.875rem 1.25rem",
                                background: "transparent",
                              }}
                            >
                              {col}
                            </Table.Th>
                          )
                        )}
                        <Table.Th
                          style={{ padding: "0.875rem 1.25rem", background: "transparent" }}
                        />
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
                              backgroundColor: isHovered
                                ? DS.surfaceHigh
                                : "transparent",
                              transition: "background-color 0.12s ease",
                              borderBottom:
                                i < statusApps.length - 1
                                  ? "1px solid rgba(255,255,255,0.04)"
                                  : "none",
                            }}
                            onMouseEnter={() => setHoveredRow(a._id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            onClick={() =>
                              url &&
                              window.open(url, "_blank", "noreferrer")
                            }
                          >
                            <Table.Td style={{ padding: "1rem 1.25rem" }}>
                              <Text
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.9375rem",
                                  color: "#ffffff",
                                  lineHeight: 1.3,
                                }}
                              >
                                {a.jobSnapshot.title}
                              </Text>
                            </Table.Td>
                            <Table.Td style={{ padding: "1rem 1.25rem" }}>
                              <Text
                                style={{
                                  fontSize: "0.875rem",
                                  color: "rgba(255,255,255,0.45)",
                                }}
                              >
                                {a.jobSnapshot.companyName}
                              </Text>
                            </Table.Td>
                            <Table.Td
                              style={{ padding: "1rem 1.25rem" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Select
                                data={APPLICATION_STATUSES.map((s) => ({
                                  value: s,
                                  label: capitalize(s),
                                }))}
                                value={a.status}
                                leftSection={
                                  <StatusDot status={a.status} />
                                }
                                renderOption={({ option }) => (
                                  <Group gap="xs" align="center">
                                    <StatusDot
                                      status={
                                        option.value as ApplicationStatus
                                      }
                                    />
                                    <Text size="sm">{option.label}</Text>
                                  </Group>
                                )}
                                onChange={async (value) => {
                                  if (!value) return;
                                  await handleStatusChange(
                                    a._id,
                                    a.jobId,
                                    a.status,
                                    value as ApplicationStatus
                                  );
                                }}
                                w={155}
                                styles={{
                                  input: {
                                    backgroundColor: DS.surfaceHigh,
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: "0.5rem",
                                  },
                                  dropdown: {
                                    backgroundColor: DS.surfaceHigh,
                                    border:
                                      "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "0.75rem",
                                  },
                                }}
                              />
                            </Table.Td>
                            <Table.Td style={{ padding: "1rem 1.25rem" }}>
                              <Text
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                {new Date(
                                  a.updatedAt
                                ).toLocaleDateString()}
                              </Text>
                            </Table.Td>
                            <Table.Td
                              style={{ padding: "1rem 1.25rem" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Group
                                gap="xs"
                                justify="flex-end"
                                wrap="nowrap"
                              >
                                {status === "STARTED" && (
                                  <button
                                    style={{
                                      padding: "0.375rem 0.875rem",
                                      borderRadius: "0.75rem",
                                      backgroundColor: DS.primary,
                                      color: DS.onPrimary,
                                      fontSize: "0.8125rem",
                                      fontWeight: 700,
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "inherit",
                                    }}
                                    onClick={() =>
                                      handleStatusChange(
                                        a._id,
                                        a.jobId,
                                        "STARTED",
                                        "APPLIED"
                                      )
                                    }
                                  >
                                    Mark Applied
                                  </button>
                                )}
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() =>
                                    handleDelete(a._id, a.jobId)
                                  }
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
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
