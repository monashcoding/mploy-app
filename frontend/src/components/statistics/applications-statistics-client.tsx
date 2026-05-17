"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Select } from "@mantine/core";
import {
  ApplicationStatusEvent,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
  UserStage,
} from "@/types/application";
import { rolePalette } from "@/lib/role-palette";

type PipelineStageName =
  | "STARTED"
  | "APPLIED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

type PipelineStats = {
  total: number;
  currentCounts: Record<PipelineStageName, number>;
  reachedApplied: number;
  reachedInterview: number;
  accepted: number;
  rejected: number;
  directRejected: number;
  postInterviewRejected: number;
  trackedEvents: number;
};

type SankeyLink = {
  id: string;
  source: PipelineStageName;
  target: PipelineStageName;
  value: number;
  label: string;
  color: string;
  kind: "primary" | "success" | "danger";
};

const PIPELINE_STAGES: PipelineStageName[] = [
  "STARTED",
  "APPLIED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

const STAGE_LABELS: Record<PipelineStageName, string> = {
  STARTED: "Started",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const STAGE_ROLES: Record<PipelineStageName, UserStage["colorRole"]> = {
  STARTED: "neutral",
  APPLIED: "active",
  INTERVIEW: "active",
  ACCEPTED: "win",
  REJECTED: "loss",
};

const NODE_LAYOUT: Record<
  PipelineStageName,
  { x: number; y: number; h: number }
> = {
  STARTED: { x: 56, y: 158, h: 92 },
  APPLIED: { x: 302, y: 158, h: 92 },
  INTERVIEW: { x: 548, y: 82, h: 92 },
  ACCEPTED: { x: 792, y: 54, h: 82 },
  REJECTED: { x: 792, y: 260, h: 82 },
};

const NODE_WIDTH = 136;

function emptyCounts(): Record<PipelineStageName, number> {
  return {
    STARTED: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
}

function buildPipelineStats(
  apps: DbApplication[],
  events: ApplicationStatusEvent[],
): PipelineStats {
  const currentCounts = emptyCounts();
  const eventsByJobId = new Map<string, ApplicationStatusEvent[]>();

  for (const event of events) {
    const existing = eventsByJobId.get(event.jobId);
    if (existing) existing.push(event);
    else eventsByJobId.set(event.jobId, [event]);
  }

  let postInterviewRejected = 0;

  for (const app of apps) {
    if (PIPELINE_STAGES.includes(app.status as PipelineStageName)) {
      currentCounts[app.status as PipelineStageName] += 1;
    }

    if (app.status !== "REJECTED") continue;

    const appEvents = eventsByJobId.get(app.jobId) ?? [];
    const touchedInterview = appEvents.some(
      (event) =>
        event.toStatus === "INTERVIEW" || event.fromStatus === "INTERVIEW",
    );
    if (touchedInterview) postInterviewRejected += 1;
  }

  const total = apps.length;
  const accepted = currentCounts.ACCEPTED;
  const rejected = currentCounts.REJECTED;
  const reachedApplied = Math.max(0, total - currentCounts.STARTED);
  const reachedInterview =
    currentCounts.INTERVIEW + accepted + postInterviewRejected;

  return {
    total,
    currentCounts,
    reachedApplied,
    reachedInterview,
    accepted,
    rejected,
    directRejected: Math.max(0, rejected - postInterviewRejected),
    postInterviewRejected,
    trackedEvents: events.length,
  };
}

function buildSankeyLinks(stats: PipelineStats): SankeyLink[] {
  const links: SankeyLink[] = [
    {
      id: "started-applied",
      source: "STARTED",
      target: "APPLIED",
      value: stats.reachedApplied,
      label: "Started to Applied",
      color: "#ffe22f",
      kind: "primary",
    },
    {
      id: "applied-interview",
      source: "APPLIED",
      target: "INTERVIEW",
      value: stats.reachedInterview,
      label: "Applied to Interview",
      color: "#ffe22f",
      kind: "primary",
    },
    {
      id: "interview-accepted",
      source: "INTERVIEW",
      target: "ACCEPTED",
      value: stats.accepted,
      label: "Interview to Accepted",
      color: "#9ddfb0",
      kind: "success",
    },
    {
      id: "applied-rejected",
      source: "APPLIED",
      target: "REJECTED",
      value: stats.directRejected,
      label: "Applied to Rejected",
      color: "#ff7351",
      kind: "danger",
    },
    {
      id: "interview-rejected",
      source: "INTERVIEW",
      target: "REJECTED",
      value: stats.postInterviewRejected,
      label: "Interview to Rejected",
      color: "#ff9275",
      kind: "danger",
    },
  ];

  return links.filter((link) => link.value > 0);
}

function linkPath(link: SankeyLink) {
  const source = NODE_LAYOUT[link.source];
  const target = NODE_LAYOUT[link.target];
  const sourceX = source.x + NODE_WIDTH;
  const targetX = target.x;
  const sourceY = source.y + source.h / 2;
  const targetY = target.y + target.h / 2;
  const midX = sourceX + (targetX - sourceX) * 0.54;

  return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
}

function sankeyNodeValue(stageName: PipelineStageName, stats: PipelineStats) {
  switch (stageName) {
    case "STARTED":
      return stats.total;
    case "APPLIED":
      return stats.reachedApplied;
    case "INTERVIEW":
      return stats.reachedInterview;
    case "ACCEPTED":
      return stats.accepted;
    case "REJECTED":
      return stats.rejected;
  }
}

function ApplicationSankey({ stats }: { stats: PipelineStats }) {
  const links = buildSankeyLinks(stats);
  const maxLinkValue = Math.max(1, ...links.map((link) => link.value));

  return (
    <div className="stats-sankey-shell">
      {stats.total === 0 ? (
        <div className="stats-empty-state">
          <div>
            <h3>No applications tracked yet</h3>
            <p>Add applications to start building your pipeline statistics.</p>
          </div>
          <Link className="stats-empty-action" href="/my-applications">
            Add applications
          </Link>
        </div>
      ) : (
        <svg
          className="stats-sankey"
          viewBox="0 0 980 420"
          role="img"
          aria-label="Application pipeline Sankey diagram"
        >
          <g className="stats-sankey-links">
            {[...links]
              .sort((a, b) => b.value - a.value)
              .map((link) => {
                const strokeWidth = 5 + (link.value / maxLinkValue) * 44;
                return (
                  <path
                    key={link.id}
                    className={`stats-sankey-link stats-sankey-link--${link.kind}`}
                    d={linkPath(link)}
                    stroke={link.color}
                    strokeWidth={strokeWidth}
                  >
                    <title>
                      {link.label}: {link.value}
                    </title>
                  </path>
                );
              })}
          </g>
          <g className="stats-sankey-nodes">
            {PIPELINE_STAGES.map((stageName) => {
              const node = NODE_LAYOUT[stageName];
              const palette = rolePalette(STAGE_ROLES[stageName]);
              return (
                <g
                  key={stageName}
                  className="stats-sankey-node"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <rect
                    width={NODE_WIDTH}
                    height={node.h}
                    rx="8"
                    fill="#242424"
                    stroke={palette.dot}
                  />
                  <circle cx="20" cy="22" r="5" fill={palette.dot} />
                  <text x="34" y="27" className="stats-sankey-node-label">
                    {STAGE_LABELS[stageName]}
                  </text>
                  <text x="20" y="64" className="stats-sankey-node-value">
                    {sankeyNodeValue(stageName, stats)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  role,
}: {
  label: string;
  value: number;
  detail: string;
  role: UserStage["colorRole"];
}) {
  const palette = rolePalette(role);

  return (
    <div className="stats-tile">
      <div className="stats-tile-label">
        <span
          className="apps-status-dot"
          style={{ backgroundColor: palette.dot }}
        />
        {label}
      </div>
      <div className="stats-tile-value" style={{ color: palette.solid }}>
        {value}
      </div>
      <div className="stats-tile-detail">{detail}</div>
    </div>
  );
}

export default function ApplicationsStatisticsClient({
  initialApps,
  initialEvents,
  initialCycles,
}: {
  initialApps: DbApplication[];
  initialEvents: ApplicationStatusEvent[];
  initialCycles: RecruitmentCycle[];
}) {
  const { status: sessionStatus } = useSession();
  const [selectedCycleId, setSelectedCycleId] = useState(
    initialCycles[0]?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID,
  );

  const selectedCycle = initialCycles.find(
    (cycle) => cycle.id === selectedCycleId,
  ) ??
    initialCycles[0] ?? {
      id: DEFAULT_RECRUITMENT_CYCLE_ID,
      name: "Current cycle",
      isDefault: true,
      createdAt: "",
      updatedAt: "",
    };

  const cycleApps = useMemo(
    () =>
      initialApps.filter(
        (app) =>
          (app.cycleId ?? DEFAULT_RECRUITMENT_CYCLE_ID) === selectedCycle.id,
      ),
    [initialApps, selectedCycle.id],
  );

  const cycleJobIds = useMemo(
    () => new Set(cycleApps.map((app) => app.jobId)),
    [cycleApps],
  );

  const cycleEvents = useMemo(
    () => initialEvents.filter((event) => cycleJobIds.has(event.jobId)),
    [cycleJobIds, initialEvents],
  );

  const stats = useMemo(
    () => buildPipelineStats(cycleApps, cycleEvents),
    [cycleApps, cycleEvents],
  );

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
          href="/sign-in?callbackUrl=%2Fstatistics"
        >
          Sign in
        </Link>{" "}
        to view your application statistics.
      </Box>
    );
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <div>
          <h1 className="stats-title">Statistics</h1>
          <p className="stats-subtitle">
            {stats.total} applications in {selectedCycle.name}
          </p>
        </div>
        <Select
          aria-label="Recruitment cycle"
          value={selectedCycle.id}
          onChange={(value) =>
            setSelectedCycleId(value ?? DEFAULT_RECRUITMENT_CYCLE_ID)
          }
          data={initialCycles.map((cycle) => ({
            value: cycle.id,
            label: cycle.name,
          }))}
          allowDeselect={false}
          className="stats-cycle-select"
          styles={{
            input: {
              backgroundColor: "transparent",
              border: "2px solid #3a3a3a",
              borderRadius: "0.65rem",
              color: "white",
              minHeight: 34,
            },
            dropdown: {
              backgroundColor: "#2e2e2e",
              border: "2px solid #3a3a3a",
            },
            option: {
              fontSize: 13,
            },
          }}
        />
      </div>

      <div className="stats-grid">
        <StatTile
          label="Total"
          value={stats.total}
          detail={`${stats.reachedApplied} reached Applied`}
          role="neutral"
        />
        <StatTile
          label="Interview"
          value={stats.reachedInterview}
          detail={`${stats.currentCounts.INTERVIEW} active now`}
          role="active"
        />
        <StatTile
          label="Accepted"
          value={stats.accepted}
          detail="through Interview"
          role="win"
        />
        <StatTile
          label="Rejected"
          value={stats.rejected}
          detail={`${stats.postInterviewRejected} after Interview`}
          role="loss"
        />
      </div>

      <section className="stats-panel">
        <div className="stats-panel-head">
          <div>
            <h2>Pipeline flow</h2>
            <p>
              Current applications with tracked interview history layered in.
            </p>
          </div>
          <div className="stats-tracked-pill">
            {stats.trackedEvents} tracked move
            {stats.trackedEvents === 1 ? "" : "s"}
          </div>
        </div>
        <ApplicationSankey stats={stats} />
      </section>

      <section className="stats-breakdown">
        <div>
          <h2>Rejection split</h2>
          <p>Rejected applications are split once interview history exists.</p>
        </div>
        <div className="stats-rejection-bars">
          <div className="stats-rejection-row">
            <span>Applied screen</span>
            <div>
              <strong>{stats.directRejected}</strong>
              <span
                style={{
                  width:
                    stats.rejected > 0
                      ? `${(stats.directRejected / stats.rejected) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
          <div className="stats-rejection-row">
            <span>After interview</span>
            <div>
              <strong>{stats.postInterviewRejected}</strong>
              <span
                style={{
                  width:
                    stats.rejected > 0
                      ? `${(stats.postInterviewRejected / stats.rejected) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
