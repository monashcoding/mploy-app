"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Alert,
  Badge,
  Card,
  Group,
  Select,
  Table,
  Text,
  Title,
} from "@mantine/core";
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
import { syncLocalApplications, updateApplicationStatus } from "@/app/my-applications/actions";

function statusColor(status: ApplicationStatus) {
  switch (status) {
    case "STARTED":
      return "gray";
    case "APPLIED":
      return "blue";
    case "INTERVIEW":
      return "yellow";
    case "OFFER":
      return "teal";
    case "ACCEPTED":
      return "green";
    case "REJECTED":
      return "red";
    case "WITHDREW":
      return "orange";
    default:
      return "gray";
  }
}

export default function MyApplicationsClient({ initial }: { initial: DbApplication[] }) {
  const { data: session, status: sessionStatus } = useSession();
  const [apps, setApps] = useState<DbApplication[]>(initial);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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
        setSyncMessage("Couldn’t sync local applications yet. Try refreshing.");
      }
    })();
  }, [sessionStatus]);

  const summary = useMemo(() => {
    const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
      ApplicationStatus,
      number
    >;
    for (const a of apps) counts[a.status] += 1;
    const total = apps.length;
    const mostRecent = apps[0]?.updatedAt;
    return { counts, total, mostRecent };
  }, [apps]);

  if (sessionStatus === "unauthenticated") {
    return (
      <Alert color="yellow">
        You’re not signed in.{" "}
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

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={3}>Summary</Title>
            <Text size="sm" c="dimmed">
              Total: {summary.total}
              {summary.mostRecent ? ` · Updated ${new Date(summary.mostRecent).toLocaleString()}` : ""}
            </Text>
          </div>
          <Group gap="xs">
            {APPLICATION_STATUSES.map((s) => (
              <Badge key={s} color={statusColor(s)} variant="light">
                {s}: {summary.counts[s]}
              </Badge>
            ))}
          </Group>
        </Group>
      </Card>

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="sm">
          <Title order={3}>My Applications</Title>
          {session?.user ? (
            <Text size="sm" c="dimmed">
              Signed in as {session.user.email}
            </Text>
          ) : null}
        </Group>

        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role</Table.Th>
              <Table.Th>Company</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Started</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th>Link</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {apps.map((a) => (
              <Table.Tr key={a._id}>
                <Table.Td>{a.jobSnapshot.title}</Table.Td>
                <Table.Td>{a.jobSnapshot.companyName}</Table.Td>
                <Table.Td>
                  <Select
                    data={APPLICATION_STATUSES.map((s) => ({ value: s, label: s }))}
                    value={a.status}
                    onChange={async (value) => {
                      if (!value) return;
                      const next = value as ApplicationStatus;
                      setApps((prev) =>
                        prev.map((p) => (p._id === a._id ? { ...p, status: next } : p)),
                      );
                      try {
                        await updateApplicationStatus(a.jobId, next);
                      } catch {
                        // revert on failure
                        setApps((prev) =>
                          prev.map((p) => (p._id === a._id ? { ...p, status: a.status } : p)),
                        );
                      }
                    }}
                    w={170}
                  />
                </Table.Td>
                <Table.Td>{new Date(a.startedAt).toLocaleDateString()}</Table.Td>
                <Table.Td>{new Date(a.updatedAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  {a.jobSnapshot.applicationUrl ? (
                    <a className="underline" href={a.jobSnapshot.applicationUrl} target="_blank" rel="noreferrer">
                      Apply
                    </a>
                  ) : (
                    <Text size="sm" c="dimmed">
                      —
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
            {!apps.length && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed">No applications yet. Click “Apply Now” on a job to start tracking.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

