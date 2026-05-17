"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { Box, Select } from "@mantine/core";
import { IconExternalLink, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ApplicationStatusEvent,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
  UserStage,
} from "@/types/application";
import CompanyLogo from "@/components/jobs/company-logo";
import { rolePalette } from "@/lib/role-palette";
import { relativeDate } from "@/lib/utils";

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

type StageDrilldownApplication = {
  app: DbApplication;
  flowLabel: string;
  inferred: boolean;
};

type StageDrilldown = {
  stage: PipelineStageName;
  title: string;
  description: string;
  value: number;
  apps: StageDrilldownApplication[];
};

type CompanyCount = {
  name: string;
  count: number;
};

type RecentMovement = {
  id: string;
  app: DbApplication;
  label: string;
  createdAt: string;
};

type MovementBucket = {
  label: string;
  count: number;
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
const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

const pageMotion = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.03 },
  },
};

const panelMotion = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: PANEL_EASE },
  },
};

const listItemMotion = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: PANEL_EASE },
  },
};

function emptyCounts(): Record<PipelineStageName, number> {
  return {
    STARTED: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
}

function isPipelineStage(status: string): status is PipelineStageName {
  return PIPELINE_STAGES.includes(status as PipelineStageName);
}

function stageRole(status: string): UserStage["colorRole"] {
  return isPipelineStage(status) ? STAGE_ROLES[status] : "neutral";
}

function formatStageName(status: string | null | undefined) {
  if (!status) return "Unknown";
  if (isPipelineStage(status)) return STAGE_LABELS[status];

  return status
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatPercent(value: number, total: number) {
  return `${percentNumber(value, total)}%`;
}

function percentNumber(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function pluralLabel(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function buildEventsByJobId(events: ApplicationStatusEvent[]) {
  const eventsByJobId = new Map<string, ApplicationStatusEvent[]>();

  for (const event of events) {
    const existing = eventsByJobId.get(event.jobId);
    if (existing) existing.push(event);
    else eventsByJobId.set(event.jobId, [event]);
  }

  for (const appEvents of eventsByJobId.values()) {
    appEvents.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return eventsByJobId;
}

function touchedStage(
  appEvents: ApplicationStatusEvent[] | undefined,
  stage: PipelineStageName,
) {
  return (
    appEvents?.some(
      (event) => event.toStatus === stage || event.fromStatus === stage,
    ) ?? false
  );
}

function buildPipelineStats(
  apps: DbApplication[],
  events: ApplicationStatusEvent[],
): PipelineStats {
  const currentCounts = emptyCounts();
  const eventsByJobId = buildEventsByJobId(events);
  let postInterviewRejected = 0;

  for (const app of apps) {
    if (isPipelineStage(app.status)) {
      currentCounts[app.status] += 1;
    }

    if (app.status !== "REJECTED") continue;

    if (touchedStage(eventsByJobId.get(app.jobId), "INTERVIEW")) {
      postInterviewRejected += 1;
    }
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

function PipelineDotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;

    if (!canvas || !ctx || !parent) return;
    const dotCanvas = canvas;
    const context = ctx;
    const container = parent;

    const gridSize = 25;
    const dotSize = 1;
    const cursorRadius = 100;
    let dots: { x: number; y: number }[] = [];
    let width = 0;
    let height = 0;
    let animationFrameId = 0;

    function resize() {
      const { devicePixelRatio: ratio = 1 } = window;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dotCanvas.width = width * ratio;
      dotCanvas.height = height * ratio;
      dotCanvas.style.width = `${width}px`;
      dotCanvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const rows = Math.ceil(height / gridSize) + 1;
      const cols = Math.ceil(width / gridSize) + 1;
      dots = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          dots.push({ x: col * gridSize, y: row * gridSize });
        }
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = dotCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        mouseRef.current = { x: -1000, y: -1000 };
        return;
      }

      mouseRef.current = { x, y };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    function animate() {
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const dx = dot.x - mouseRef.current.x;
        const dy = dot.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const opacity =
          distance < cursorRadius
            ? 0.08 + (1 - distance / cursorRadius) * 0.3
            : 0.08;

        context.beginPath();
        context.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        context.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    resize();
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="stats-pipeline-dots" />;
}

function buildStageDrilldown(
  stage: PipelineStageName,
  apps: DbApplication[],
  stats: PipelineStats,
  eventsByJobId: Map<string, ApplicationStatusEvent[]>,
): StageDrilldown {
  const stageApps = apps
    .reduce<StageDrilldownApplication[]>((items, app) => {
      const status = app.status;
      const appEvents = eventsByJobId.get(app.jobId);
      const hadInterview = touchedStage(appEvents, "INTERVIEW");

      if (stage === "STARTED") {
        items.push({
          app,
          flowLabel: `Current: ${formatStageName(status)}`,
          inferred: false,
        });
      } else if (stage === "APPLIED" && status !== "STARTED") {
        items.push({
          app,
          flowLabel: `Reached Applied`,
          inferred: status === "ACCEPTED" && !hadInterview,
        });
      } else if (
        stage === "INTERVIEW" &&
        (status === "INTERVIEW" ||
          status === "ACCEPTED" ||
          (status === "REJECTED" && hadInterview))
      ) {
        items.push({
          app,
          flowLabel:
            status === "ACCEPTED" && !hadInterview
              ? "Interview inferred"
              : status === "REJECTED"
                ? "After interview"
                : `Current: ${formatStageName(status)}`,
          inferred: status === "ACCEPTED" && !hadInterview,
        });
      } else if (stage === "ACCEPTED" && status === "ACCEPTED") {
        items.push({
          app,
          flowLabel: hadInterview
            ? "Tracked interview path"
            : "Interview inferred",
          inferred: !hadInterview,
        });
      } else if (stage === "REJECTED" && status === "REJECTED") {
        items.push({
          app,
          flowLabel: hadInterview ? "After interview" : "Applied screen",
          inferred: false,
        });
      }

      return items;
    }, [])
    .sort((a, b) => b.app.updatedAt.localeCompare(a.app.updatedAt));

  const descriptions: Record<PipelineStageName, string> = {
    STARTED: "Every application in this recruitment cycle.",
    APPLIED: "Applications that moved beyond Started.",
    INTERVIEW:
      "Applications with interview activity, plus accepted roles inferred through interview.",
    ACCEPTED: "Applications currently marked as accepted.",
    REJECTED: "Applications currently marked as rejected.",
  };

  return {
    stage,
    title: STAGE_LABELS[stage],
    description: descriptions[stage],
    value: sankeyNodeValue(stage, stats),
    apps: stageApps,
  };
}

function buildTopCompanies(apps: DbApplication[]): CompanyCount[] {
  const counts = new Map<string, number>();

  for (const app of apps) {
    const name = app.jobSnapshot.companyName.trim() || "Unknown company";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function buildRecentMovements(
  apps: DbApplication[],
  events: ApplicationStatusEvent[],
): RecentMovement[] {
  const appsByJobId = new Map(apps.map((app) => [app.jobId, app]));

  return [...events]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .reduce<RecentMovement[]>((items, event) => {
      if (items.length >= 5) return items;

      const app = appsByJobId.get(event.jobId);
      if (!app) return items;

      const label =
        event.fromStatus && event.fromStatus !== event.toStatus
          ? `${formatStageName(event.fromStatus)} -> ${formatStageName(
              event.toStatus,
            )}`
          : event.source === "application_created"
            ? `Added to ${formatStageName(event.toStatus)}`
            : `Set to ${formatStageName(event.toStatus)}`;

      items.push({
        id: event._id,
        app,
        label,
        createdAt: event.createdAt,
      });

      return items;
    }, []);
}

function buildMovementBuckets(events: ApplicationStatusEvent[]) {
  const dayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startTime = today.getTime() - dayMs * 6;
  const buckets: MovementBucket[] = Array.from({ length: 7 }, (_, index) => ({
    label: index === 6 ? "Today" : `${6 - index}d`,
    count: 0,
  }));

  for (const event of events) {
    const eventDay = new Date(event.createdAt);
    eventDay.setHours(0, 0, 0, 0);
    const index = Math.floor((eventDay.getTime() - startTime) / dayMs);
    if (index >= 0 && index < buckets.length) {
      buckets[index].count += 1;
    }
  }

  return buckets;
}

function ApplicationSankey({
  stats,
  selectedStage,
  onStageSelect,
}: {
  stats: PipelineStats;
  selectedStage: PipelineStageName | null;
  onStageSelect: (stage: PipelineStageName) => void;
}) {
  const links = buildSankeyLinks(stats);
  const maxLinkValue = Math.max(1, ...links.map((link) => link.value));

  function handleNodeKeyDown(
    event: KeyboardEvent<SVGGElement>,
    stageName: PipelineStageName,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onStageSelect(stageName);
  }

  return (
    <div className="stats-sankey-shell">
      <PipelineDotField />
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
                  <motion.path
                    key={link.id}
                    className={`stats-sankey-link stats-sankey-link--${link.kind}`}
                    d={linkPath(link)}
                    stroke={link.color}
                    strokeWidth={strokeWidth}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.75, ease: PANEL_EASE }}
                  >
                    <title>
                      {link.label}: {link.value}
                    </title>
                  </motion.path>
                );
              })}
          </g>
          <g className="stats-sankey-nodes">
            {PIPELINE_STAGES.map((stageName) => {
              const node = NODE_LAYOUT[stageName];
              const palette = rolePalette(STAGE_ROLES[stageName]);
              const selected = selectedStage === stageName;

              return (
                <g
                  key={stageName}
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <motion.g
                    className={`stats-sankey-node${selected ? " is-selected" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Show ${STAGE_LABELS[stageName]} applications`}
                    onClick={() => onStageSelect(stageName)}
                    onKeyDown={(event) => handleNodeKeyDown(event, stageName)}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.34, ease: PANEL_EASE }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <rect
                      width={NODE_WIDTH}
                      height={node.h}
                      rx="8"
                      fill="#242424"
                      stroke={palette.dot}
                    />
                    {stageName === "STARTED" && (
                      <text x="18" y="-13" className="stats-sankey-click-label">
                        click me
                      </text>
                    )}
                    <circle cx="20" cy="22" r="5" fill={palette.dot} />
                    <text x="34" y="27" className="stats-sankey-node-label">
                      {STAGE_LABELS[stageName]}
                    </text>
                    <text x="20" y="64" className="stats-sankey-node-value">
                      {sankeyNodeValue(stageName, stats)}
                    </text>
                  </motion.g>
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
  value: number | string;
  detail: string;
  role: UserStage["colorRole"];
}) {
  const palette = rolePalette(role);

  return (
    <motion.div className="stats-tile" {...panelMotion}>
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
    </motion.div>
  );
}

function ConversionRow({
  label,
  value,
  count,
  role,
}: {
  label: string;
  value: number;
  count: string;
  role: UserStage["colorRole"];
}) {
  const palette = rolePalette(role);

  return (
    <motion.div className="stats-rate-row" {...listItemMotion}>
      <div>
        <span>{label}</span>
        <strong style={{ color: palette.solid }}>{value}%</strong>
      </div>
      <div className="stats-rate-track">
        <motion.span
          style={{
            backgroundColor: palette.dot,
          }}
          initial={{ width: 0 }}
          whileInView={{
            width: `${Math.min(100, Math.max(0, value))}%`,
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: PANEL_EASE }}
        />
      </div>
      <p>{count}</p>
    </motion.div>
  );
}

function OutcomeMixPanel({
  stats,
  activeCount,
}: {
  stats: PipelineStats;
  activeCount: number;
}) {
  const activePct = percentNumber(activeCount, stats.total);
  const acceptedPct = percentNumber(stats.accepted, stats.total);
  const acceptedStop = activePct + acceptedPct;
  const hasApps = stats.total > 0;

  return (
    <motion.section
      className="stats-panel stats-visual-panel stats-outcome-panel"
      {...panelMotion}
    >
      <div className="stats-mini-head">
        <h2>Outcome mix</h2>
        <span>{formatPercent(stats.accepted, stats.total)} accepted</span>
      </div>
      <div className="stats-outcome-body">
        <motion.div
          className="stats-outcome-ring"
          style={{
            background: hasApps
              ? `conic-gradient(#ffe22f 0 ${activePct}%, #9ddfb0 ${activePct}% ${acceptedStop}%, #ff7351 ${acceptedStop}% 100%)`
              : "rgba(255, 255, 255, 0.06)",
          }}
          initial={{ opacity: 0, rotate: -36, scale: 0.88 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.58, ease: PANEL_EASE }}
        >
          <div>
            <strong>{activeCount}</strong>
            <span>active</span>
          </div>
        </motion.div>
        <div className="stats-outcome-legend">
          <span>
            <i style={{ backgroundColor: "#ffe22f" }} />
            Active <strong>{activeCount}</strong>
          </span>
          <span>
            <i style={{ backgroundColor: "#9ddfb0" }} />
            Accepted <strong>{stats.accepted}</strong>
          </span>
          <span>
            <i style={{ backgroundColor: "#ff7351" }} />
            Rejected <strong>{stats.rejected}</strong>
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function MovementSparkPanel({ buckets }: { buckets: MovementBucket[] }) {
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <motion.section className="stats-panel stats-visual-panel" {...panelMotion}>
      <div className="stats-mini-head">
        <h2>7-day movement</h2>
        <span>{total} moves</span>
      </div>
      <div className="stats-spark-bars" aria-label="Status moves over 7 days">
        {buckets.map((bucket) => (
          <div key={bucket.label}>
            <motion.span
              title={`${bucket.label}: ${bucket.count} moves`}
              initial={{ height: 8, opacity: 0.55 }}
              whileInView={{
                height: `${Math.max(8, (bucket.count / maxCount) * 54)}px`,
                opacity: 1,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.58, ease: PANEL_EASE }}
            />
            <small>{bucket.label}</small>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function StagePill({ status, label }: { status: string; label?: string }) {
  const palette = rolePalette(stageRole(status));

  return (
    <span
      className="stats-stage-pill"
      style={{ backgroundColor: palette.pillBg, color: palette.pillFg }}
    >
      {label ?? formatStageName(status)}
    </span>
  );
}

function StageDrilldownDrawer({
  drilldown,
  onClose,
}: {
  drilldown: StageDrilldown;
  onClose: () => void;
}) {
  const palette = rolePalette(STAGE_ROLES[drilldown.stage]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="stats-drilldown"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.button
        className="stats-drilldown-backdrop"
        type="button"
        aria-label="Close application details"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        className="stats-drilldown-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-drilldown-title"
        initial={{ x: 36, opacity: 0, scale: 0.985 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 34, opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.28, ease: PANEL_EASE }}
      >
        <header className="stats-drilldown-head">
          <div>
            <div className="stats-drilldown-kicker">
              <span style={{ backgroundColor: palette.dot }} />
              Sankey selection
            </div>
            <h2 id="stats-drilldown-title">{drilldown.title}</h2>
            <p>{drilldown.description}</p>
          </div>
          <button
            className="stats-drilldown-close"
            type="button"
            aria-label="Close application details"
            onClick={onClose}
          >
            <IconX size={17} aria-hidden />
          </button>
        </header>

        <div className="stats-drilldown-count">
          <strong style={{ color: palette.solid }}>{drilldown.value}</strong>
          <span>{pluralLabel(drilldown.value, "application")}</span>
        </div>

        {drilldown.apps.length === 0 ? (
          <div className="stats-drawer-empty">
            No applications currently sit in this slice of the pipeline.
          </div>
        ) : (
          <ul className="stats-app-list">
            {drilldown.apps.map(({ app, flowLabel, inferred }) => (
              <motion.li
                key={app._id}
                className="stats-app-item"
                {...listItemMotion}
              >
                <CompanyLogo
                  name={app.jobSnapshot.companyName}
                  logo={app.jobSnapshot.logo}
                  applicationUrl={app.jobSnapshot.applicationUrl}
                  className="h-9 w-9 flex-shrink-0"
                />
                <div className="stats-app-copy">
                  <div className="stats-app-title-row">
                    <h3>{app.jobSnapshot.title}</h3>
                    {app.jobSnapshot.applicationUrl && (
                      <a
                        className="stats-app-link"
                        href={app.jobSnapshot.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${app.jobSnapshot.title} application`}
                        title="Open application"
                      >
                        <IconExternalLink size={15} aria-hidden />
                      </a>
                    )}
                  </div>
                  <p>{app.jobSnapshot.companyName}</p>
                  <div className="stats-app-meta">
                    <StagePill status={app.status} />
                    <StagePill
                      status={inferred ? "INTERVIEW" : app.status}
                      label={flowLabel}
                    />
                    <span>Updated {relativeDate(app.updatedAt)}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.aside>
    </motion.div>
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
  const shouldReduceMotion = useReducedMotion();
  const [selectedCycleId, setSelectedCycleId] = useState(
    initialCycles[0]?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID,
  );
  const [selectedStage, setSelectedStage] = useState<PipelineStageName | null>(
    null,
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

  const eventsByJobId = useMemo(
    () => buildEventsByJobId(cycleEvents),
    [cycleEvents],
  );

  const stats = useMemo(
    () => buildPipelineStats(cycleApps, cycleEvents),
    [cycleApps, cycleEvents],
  );

  const selectedDrilldown = useMemo(
    () =>
      selectedStage
        ? buildStageDrilldown(selectedStage, cycleApps, stats, eventsByJobId)
        : null,
    [cycleApps, eventsByJobId, selectedStage, stats],
  );

  const topCompanies = useMemo(() => buildTopCompanies(cycleApps), [cycleApps]);
  const recentMovements = useMemo(
    () => buildRecentMovements(cycleApps, cycleEvents),
    [cycleApps, cycleEvents],
  );
  const movementBuckets = useMemo(
    () => buildMovementBuckets(cycleEvents),
    [cycleEvents],
  );

  const activeCount =
    stats.currentCounts.STARTED +
    stats.currentCounts.APPLIED +
    stats.currentCounts.INTERVIEW;
  const appliedToInterviewRate = Number(
    formatPercent(stats.reachedInterview, stats.reachedApplied).replace(
      "%",
      "",
    ),
  );
  const interviewToAcceptedRate = Number(
    formatPercent(stats.accepted, stats.reachedInterview).replace("%", ""),
  );
  const rejectionRate = Number(
    formatPercent(stats.rejected, stats.reachedApplied).replace("%", ""),
  );
  const maxTopCompanyCount = Math.max(
    1,
    ...topCompanies.map((company) => company.count),
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
    <motion.div
      className="stats-page"
      initial={shouldReduceMotion ? false : pageMotion.initial}
      animate={pageMotion.animate}
    >
      <motion.div className="stats-header" {...panelMotion}>
        <div>
          <h1 className="stats-title">Statistics</h1>
          <p className="stats-subtitle">
            {stats.total} applications in {selectedCycle.name}
          </p>
        </div>
        <Select
          aria-label="Recruitment cycle"
          value={selectedCycle.id}
          onChange={(value) => {
            setSelectedCycleId(value ?? DEFAULT_RECRUITMENT_CYCLE_ID);
            setSelectedStage(null);
          }}
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
              borderRadius: "0.5rem",
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
      </motion.div>

      <motion.div className="stats-grid" {...panelMotion}>
        <StatTile
          label="Total"
          value={stats.total}
          detail={`${stats.reachedApplied} reached Applied`}
          role="neutral"
        />
        <StatTile
          label="Active"
          value={activeCount}
          detail={`${stats.currentCounts.INTERVIEW} interviewing`}
          role="active"
        />
        <StatTile
          label="Interview rate"
          value={formatPercent(stats.reachedInterview, stats.reachedApplied)}
          detail={`${stats.reachedInterview} reached Interview`}
          role="active"
        />
        <StatTile
          label="Offer rate"
          value={formatPercent(stats.accepted, stats.reachedInterview)}
          detail={`${stats.accepted} accepted`}
          role="win"
        />
        <StatTile
          label="Rejected"
          value={stats.rejected}
          detail={`${stats.postInterviewRejected} after Interview`}
          role="loss"
        />
      </motion.div>

      <div className="stats-visual-grid">
        <OutcomeMixPanel stats={stats} activeCount={activeCount} />
        <MovementSparkPanel buckets={movementBuckets} />
      </div>

      <motion.section className="stats-panel stats-flow-panel" {...panelMotion}>
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
        <ApplicationSankey
          stats={stats}
          selectedStage={selectedStage}
          onStageSelect={setSelectedStage}
        />
      </motion.section>

      <div className="stats-dashboard-grid">
        <motion.section
          className="stats-panel stats-insight-panel"
          {...panelMotion}
        >
          <div className="stats-panel-head">
            <div>
              <h2>Conversion</h2>
              <p>How applications move through the core stages.</p>
            </div>
          </div>
          <div className="stats-panel-body">
            <ConversionRow
              label="Applied to Interview"
              value={appliedToInterviewRate}
              count={`${stats.reachedInterview} of ${stats.reachedApplied}`}
              role="active"
            />
            <ConversionRow
              label="Interview to Accepted"
              value={interviewToAcceptedRate}
              count={`${stats.accepted} of ${stats.reachedInterview}`}
              role="win"
            />
            <ConversionRow
              label="Applied to Rejected"
              value={rejectionRate}
              count={`${stats.rejected} of ${stats.reachedApplied}`}
              role="loss"
            />
          </div>
        </motion.section>

        <motion.section
          className="stats-panel stats-insight-panel"
          {...panelMotion}
        >
          <div className="stats-panel-head">
            <div>
              <h2>Top companies</h2>
              <p>Where your tracked applications are clustered.</p>
            </div>
          </div>
          <div className="stats-panel-body">
            {topCompanies.length === 0 ? (
              <div className="stats-quiet-empty">No companies yet.</div>
            ) : (
              <ul className="stats-company-list">
                {topCompanies.map((company) => (
                  <motion.li key={company.name} {...listItemMotion}>
                    <div>
                      <span>{company.name}</span>
                      <em>
                        <motion.i
                          style={{
                            width: `${(company.count / maxTopCompanyCount) * 100}%`,
                          }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.62, ease: PANEL_EASE }}
                        />
                      </em>
                    </div>
                    <strong>{company.count}</strong>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.section>
      </div>

      <div className="stats-lower-grid">
        <motion.section className="stats-breakdown" {...panelMotion}>
          <div>
            <h2>Rejection split</h2>
            <p>
              Rejected applications are split once interview history exists.
            </p>
          </div>
          <div className="stats-rejection-bars">
            <div className="stats-rejection-row">
              <span>Applied screen</span>
              <div>
                <strong>{stats.directRejected}</strong>
                <motion.span
                  style={{
                    width:
                      stats.rejected > 0
                        ? `${(stats.directRejected / stats.rejected) * 100}%`
                        : "0%",
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, ease: PANEL_EASE }}
                />
              </div>
            </div>
            <div className="stats-rejection-row">
              <span>After interview</span>
              <div>
                <strong>{stats.postInterviewRejected}</strong>
                <motion.span
                  style={{
                    width:
                      stats.rejected > 0
                        ? `${(stats.postInterviewRejected / stats.rejected) * 100}%`
                        : "0%",
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, ease: PANEL_EASE }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="stats-panel stats-recent-panel"
          {...panelMotion}
        >
          <div className="stats-panel-head">
            <div>
              <h2>Recent movement</h2>
              <p>The latest tracked status changes in this cycle.</p>
            </div>
          </div>
          <div className="stats-panel-body">
            {recentMovements.length === 0 ? (
              <div className="stats-quiet-empty">No movements tracked yet.</div>
            ) : (
              <ul className="stats-movement-list">
                {recentMovements.map((movement) => (
                  <motion.li key={movement.id} {...listItemMotion}>
                    <span>{movement.label}</span>
                    <strong>{movement.app.jobSnapshot.companyName}</strong>
                    <small>{relativeDate(movement.createdAt)}</small>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {selectedDrilldown && (
          <StageDrilldownDrawer
            drilldown={selectedDrilldown}
            onClose={() => setSelectedStage(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
