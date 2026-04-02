"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
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

const STATUS_ORDER: ApplicationStatus[] = [
  "STARTED",
  "INTERVIEW",
  "APPLIED",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

function statusColor(status: ApplicationStatus) {
  switch (status) {
    case "STARTED":   return "gray";
    case "APPLIED":   return "blue";
    case "INTERVIEW": return "yellow";
    case "OFFER":     return "teal";
    case "ACCEPTED":  return "green";
    case "REJECTED":  return "red";
    default:          return "gray";
  }
}

function statusDotColor(status: ApplicationStatus | string) {
  switch (status) {
    case "STARTED":   return "var(--mantine-color-gray-5)";
    case "APPLIED":   return "var(--mantine-color-blue-5)";
    case "INTERVIEW": return "var(--mantine-color-yellow-5)";
    case "OFFER":     return "var(--mantine-color-teal-5)";
    case "ACCEPTED":  return "var(--mantine-color-green-5)";
    case "REJECTED":  return "var(--mantine-color-red-5)";
    default:          return "var(--mantine-color-gray-5)";
  }
}

function capitalize(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function StatusDot({ status }: { status: ApplicationStatus | string }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: statusDotColor(status),
        flexShrink: 0,
      }}
    />
  );
}

export default function MyApplicationsClient({ initial }: { initial: DbApplication[] }) {
  const { data: session, status: sessionStatus } = useSession();
  const [apps, setApps] = useState<DbApplication[]>(initial);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(STATUS_ORDER as string[]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    const local = getLocalApplications();
    if (!local.length) return;

    (async () => {
      try {
        const res = await syncLocalApplications(local);
        clearLocalApplications();
        setSyncMessage(`Synced ${res.upserted} application${res.upserted === 1 ? "" : "s"} from this device.`);
      } catch {
        setSyncMessage("Couldn't sync local applications yet. Try refreshing.");
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
    next: ApplicationStatus,
  ) {
    setApps((prev) => prev.map((p) => (p._id === appId ? { ...p, status: next } : p)));
    try {
      await updateApplicationStatus(jobId, next);
    } catch {
      setApps((prev) => prev.map((p) => (p._id === appId ? { ...p, status: oldStatus } : p)));
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
      <Alert color="yellow">
        You're not signed in.{" "}
        <Link className="underline" href="/sign-in?callbackUrl=%2Fmy-applications">
          Sign in
        </Link>{" "}
        to view and manage your applications across devices.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {syncMessage && <Alert>{syncMessage}</Alert>}

      {/* Summary + filter row */}
      <div className="flex flex-wrap gap-4 items-start">
        <Card withBorder radius="lg" p="md">
          <Text size="xs" c="dimmed" mb="xs" fw={500}>
            {total} total{session?.user?.email ? ` · ${session.user.email}` : ""}
          </Text>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_ORDER.map((s) => (
              <Badge key={s} color={statusColor(s)} variant="light" size="md">
                {capitalize(s)}: {grouped.get(s)?.length ?? 0}
              </Badge>
            ))}
          </div>
        </Card>

        <Popover position="bottom-start" shadow="md" withinPortal>
          <Popover.Target>
            <Button
              variant="default"
              size="sm"
              rightSection={<IconChevronDown size={14} />}
            >
              Show sections
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Checkbox.Group value={selectedStatuses} onChange={setSelectedStatuses}>
              <Stack gap="xs">
                {STATUS_ORDER.map((s) => (
                  <Checkbox
                    key={s}
                    value={s}
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
      {STATUS_ORDER.filter((s) => selectedStatuses.includes(s)).map((status) => {
        const statusApps = grouped.get(status) ?? [];
        return (
          <Card key={status} withBorder radius="lg" p="lg">
            <Group gap="sm" align="center" mb="sm">
              <Title order={4}>{capitalize(status)}</Title>
              <Badge color={statusColor(status)} variant="filled" size="sm">
                {statusApps.length}
              </Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Updated</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {statusApps.map((a) => {
                  const url = a.jobSnapshot.applicationUrl;
                  return (
                    <Table.Tr
                      key={a._id}
                      style={{ cursor: url ? "pointer" : "default" }}
                      onClick={() => url && window.open(url, "_blank", "noreferrer")}
                    >
                      <Table.Td>{a.jobSnapshot.title}</Table.Td>
                      <Table.Td>{a.jobSnapshot.companyName}</Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Select
                          data={APPLICATION_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))}
                          value={a.status}
                          leftSection={<StatusDot status={a.status} />}
                          renderOption={({ option }) => (
                            <Group gap="xs" align="center">
                              <StatusDot status={option.value} />
                              <Text size="sm">{option.label}</Text>
                            </Group>
                          )}
                          onChange={async (value) => {
                            if (!value) return;
                            await handleStatusChange(a._id, a.jobId, a.status, value as ApplicationStatus);
                          }}
                          w={155}
                        />
                      </Table.Td>
                      <Table.Td>{new Date(a.updatedAt).toLocaleDateString()}</Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          {status === "STARTED" && (
                            <Button
                              size="xs"
                              variant="light"
                              color="blue"
                              onClick={() =>
                                handleStatusChange(a._id, a.jobId, "STARTED", "APPLIED")
                              }
                            >
                              Mark Applied
                            </Button>
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
                {!statusApps.length && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" size="sm">
                        No {capitalize(status).toLowerCase()} applications.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        );
      })}
    </div>
  );
}
