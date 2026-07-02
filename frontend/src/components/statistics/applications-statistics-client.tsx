"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, Ref } from "react";
import { useMacSession } from "@/lib/mac-session";
import { Select } from "@mantine/core";
import { IconDownload, IconExternalLink, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ApplicationStatusEvent,
  DbApplication,
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
  UserStage,
} from "@/types/application";
import macLogo from "@/assets/mac.svg";
import AuthRequiredPanel from "@/components/auth/auth-required-panel";
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
const SANKEY_EXPORT_WIDTH = 1160;
const SANKEY_EXPORT_HEIGHT = 520;
const SANKEY_EXPORT_DIAGRAM_OFFSET_X = 70;
const SANKEY_EXPORT_DIAGRAM_OFFSET_Y = 80;

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

function formatCountPercent(value: number, total: number) {
  return `${value} (${formatPercent(value, total)})`;
}

function percentNumber(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function pluralLabel(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pipeline-flow"
  );
}

function triggerImageDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function staticAssetSrc(asset: string | { src: string }) {
  return typeof asset === "string" ? asset : asset.src;
}

async function svgHrefToDataUri(href: string) {
  const response = await fetch(href);
  if (!response.ok) {
    throw new Error(`Failed to load SVG asset: ${href}`);
  }

  const svgText = await response.text();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

async function macLogoDataUri() {
  try {
    return await svgHrefToDataUri(staticAssetSrc(macLogo));
  } catch {
    return svgHrefToDataUri("/mac.svg");
  }
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

function ApplicationSankey({
  stats,
  selectedStage,
  onStageSelect,
  svgRef,
}: {
  stats: PipelineStats;
  selectedStage: PipelineStageName | null;
  onStageSelect: (stage: PipelineStageName) => void;
  svgRef?: Ref<SVGSVGElement>;
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
          ref={svgRef}
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
                    <title>{`${link.label}: ${link.value}`}</title>
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

function OutcomeMixPanel({
  stats,
  activeCount,
}: {
  stats: PipelineStats;
  activeCount: number;
}) {
  const activePct = percentNumber(activeCount, stats.total);
  const acceptedPct = percentNumber(stats.accepted, stats.total);
  const rejectedPct = percentNumber(stats.rejected, stats.total);
  const acceptedStop = activePct + acceptedPct;
  const hasApps = stats.total > 0;

  return (
    <motion.section
      className="stats-panel stats-visual-panel stats-outcome-panel"
      {...panelMotion}
    >
      <div className="stats-mini-head">
        <h2>Outcome mix</h2>
        <span>
          {acceptedPct}% accepted, {rejectedPct}% rejected
        </span>
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
            <strong>{stats.total}</strong>
            <span>total</span>
          </div>
        </motion.div>
        <div className="stats-outcome-legend">
          <span>
            <i style={{ backgroundColor: "#ffe22f" }} />
            Active{" "}
            <strong>{formatCountPercent(activeCount, stats.total)}</strong>
          </span>
          <span>
            <i style={{ backgroundColor: "#9ddfb0" }} />
            Accepted{" "}
            <strong>{formatCountPercent(stats.accepted, stats.total)}</strong>
          </span>
          <span>
            <i style={{ backgroundColor: "#ff7351" }} />
            Rejected{" "}
            <strong>{formatCountPercent(stats.rejected, stats.total)}</strong>
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function RejectionSplitPanel({ stats }: { stats: PipelineStats }) {
  const directPct = percentNumber(stats.directRejected, stats.rejected);
  const postInterviewPct = percentNumber(
    stats.postInterviewRejected,
    stats.rejected,
  );

  return (
    <motion.section
      className="stats-panel stats-visual-panel stats-rejection-panel"
      {...panelMotion}
    >
      <div className="stats-mini-head">
        <h2>Rejection split</h2>
        <span>
          {formatPercent(stats.rejected, stats.reachedApplied)} rejected
        </span>
      </div>
      <div className="stats-rejection-bars">
        <div className="stats-rejection-row">
          <span>Applied screen</span>
          <div>
            <strong>
              {formatCountPercent(stats.directRejected, stats.rejected)}
            </strong>
            <motion.span
              style={{
                width: stats.rejected > 0 ? `${directPct}%` : "0%",
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
            <strong>
              {formatCountPercent(stats.postInterviewRejected, stats.rejected)}
            </strong>
            <motion.span
              style={{
                width: stats.rejected > 0 ? `${postInterviewPct}%` : "0%",
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.62, ease: PANEL_EASE }}
            />
          </div>
        </div>
      </div>
      <p className="stats-rejection-note">
        It&apos;s a numbers game. Don&apos;t give up.
      </p>
    </motion.section>
  );
}

function InterviewYieldPanel({ stats }: { stats: PipelineStats }) {
  const interviewPct = percentNumber(
    stats.reachedInterview,
    stats.reachedApplied,
  );
  const waitingForInterview = Math.max(
    0,
    stats.reachedApplied - stats.reachedInterview,
  );
  const waitingPct = percentNumber(waitingForInterview, stats.reachedApplied);

  return (
    <motion.section
      className="stats-panel stats-visual-panel stats-yield-panel"
      {...panelMotion}
    >
      <div className="stats-mini-head">
        <h2>Interview yield</h2>
        <span>
          {formatCountPercent(stats.reachedInterview, stats.reachedApplied)}
        </span>
      </div>
      <div className="stats-yield-body">
        <div className="stats-yield-value">
          <strong>{interviewPct}%</strong>
          <span>
            {stats.reachedInterview} of {stats.reachedApplied} reached Interview
          </span>
        </div>
        <div className="stats-yield-stack" aria-hidden>
          <span
            className="is-interview"
            style={{ width: `${interviewPct}%` }}
          />
          <span className="is-waiting" style={{ width: `${waitingPct}%` }} />
        </div>
        <p>{waitingForInterview} still waiting for an interview signal.</p>
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
  const { status: sessionStatus } = useMacSession();
  const shouldReduceMotion = useReducedMotion();
  const [selectedCycleId, setSelectedCycleId] = useState(
    initialCycles[0]?.id ?? DEFAULT_RECRUITMENT_CYCLE_ID,
  );
  const [selectedStage, setSelectedStage] = useState<PipelineStageName | null>(
    null,
  );
  const sankeySvgRef = useRef<SVGSVGElement | null>(null);

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

  const activeCount =
    stats.currentCounts.STARTED +
    stats.currentCounts.APPLIED +
    stats.currentCounts.INTERVIEW;
  const cycleSelectWidth = Math.min(
    280,
    Math.max(150, selectedCycle.name.length * 8 + 62),
  );

  async function downloadPipelineImage() {
    const svg = sankeySvgRef.current;
    if (!svg) return;
    const macLogoHref = await macLogoDataUri();

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(SANKEY_EXPORT_WIDTH));
    clone.setAttribute("height", String(SANKEY_EXPORT_HEIGHT));
    clone.setAttribute(
      "viewBox",
      `0 0 ${SANKEY_EXPORT_WIDTH} ${SANKEY_EXPORT_HEIGHT}`,
    );
    clone
      .querySelectorAll(".stats-sankey-click-label")
      .forEach((node) => node.remove());

    const sankeyDiagram = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    sankeyDiagram.setAttribute(
      "transform",
      `translate(${SANKEY_EXPORT_DIAGRAM_OFFSET_X}, ${SANKEY_EXPORT_DIAGRAM_OFFSET_Y})`,
    );

    const sankeyLinks = clone.querySelector(".stats-sankey-links");
    const sankeyNodes = clone.querySelector(".stats-sankey-nodes");
    if (sankeyLinks) sankeyDiagram.appendChild(sankeyLinks);
    if (sankeyNodes) sankeyDiagram.appendChild(sankeyNodes);
    clone.appendChild(sankeyDiagram);

    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent = `
      text { font-family: Poppins, Arial, sans-serif; }
      .stats-sankey-link { fill: none; stroke-linecap: round; opacity: 0.34; }
      .stats-sankey-link--success { opacity: 0.42; }
      .stats-sankey-link--danger { opacity: 0.38; }
      .stats-sankey-node rect { stroke-width: 1.5; filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22)); }
      .stats-sankey-node-label { fill: rgba(255, 255, 255, 0.86); font-size: 13px; font-weight: 800; }
      .stats-sankey-node-value { fill: white; font-size: 27px; font-weight: 800; }
    `;

    const background = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    background.setAttribute("x", "0");
    background.setAttribute("y", "0");
    background.setAttribute("width", String(SANKEY_EXPORT_WIDTH));
    background.setAttribute("height", String(SANKEY_EXPORT_HEIGHT));
    background.setAttribute("fill", "#1a1a1a");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const dotPattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern",
    );
    dotPattern.setAttribute("id", "stats-export-dot-pattern");
    dotPattern.setAttribute("width", "25");
    dotPattern.setAttribute("height", "25");
    dotPattern.setAttribute("patternUnits", "userSpaceOnUse");

    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    dot.setAttribute("cx", "1");
    dot.setAttribute("cy", "1");
    dot.setAttribute("r", "1");
    dot.setAttribute("fill", "#ffffff");
    dot.setAttribute("opacity", "0.08");
    dotPattern.appendChild(dot);
    defs.appendChild(dotPattern);

    const dotLayer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    dotLayer.setAttribute("x", "0");
    dotLayer.setAttribute("y", "0");
    dotLayer.setAttribute("width", String(SANKEY_EXPORT_WIDTH));
    dotLayer.setAttribute("height", String(SANKEY_EXPORT_HEIGHT));
    dotLayer.setAttribute("fill", "url(#stats-export-dot-pattern)");

    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    title.setAttribute("x", "34");
    title.setAttribute("y", "52");
    title.setAttribute("fill", "#ffffff");
    title.setAttribute("font-size", "28");
    title.setAttribute("font-weight", "900");
    title.textContent = selectedCycle.name;

    const titleUnderline = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    titleUnderline.setAttribute("x1", "34");
    titleUnderline.setAttribute("y1", "67");
    titleUnderline.setAttribute(
      "x2",
      String(34 + Math.min(460, Math.max(90, selectedCycle.name.length * 16))),
    );
    titleUnderline.setAttribute("y2", "67");
    titleUnderline.setAttribute("stroke", "#ffffff");
    titleUnderline.setAttribute("stroke-width", "3");
    titleUnderline.setAttribute("stroke-linecap", "round");
    titleUnderline.setAttribute("opacity", "0.92");

    const brandCenterX = SANKEY_EXPORT_WIDTH - 78;
    const brandLogoSize = 38;
    const brandLogo = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    brandLogo.setAttribute("x", String(brandCenterX - brandLogoSize / 2));
    brandLogo.setAttribute("y", "24");
    brandLogo.setAttribute("width", String(brandLogoSize));
    brandLogo.setAttribute("height", String(brandLogoSize));
    brandLogo.setAttribute("href", macLogoHref);
    brandLogo.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      macLogoHref,
    );

    const brandText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    brandText.setAttribute("x", String(brandCenterX));
    brandText.setAttribute("y", "78");
    brandText.setAttribute("fill", "#fee22f");
    brandText.setAttribute("font-size", "7.2");
    brandText.setAttribute("font-weight", "900");
    brandText.setAttribute("text-anchor", "middle");

    const brandTextTop = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    brandTextTop.setAttribute("x", String(brandCenterX));
    brandTextTop.textContent = "Monash Association";

    const brandTextBottom = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    brandTextBottom.setAttribute("x", String(brandCenterX));
    brandTextBottom.setAttribute("dy", "8");
    brandTextBottom.textContent = "of Coding";
    brandText.append(brandTextTop, brandTextBottom);

    const website = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    website.setAttribute("x", String(SANKEY_EXPORT_WIDTH - 22));
    website.setAttribute("y", String(SANKEY_EXPORT_HEIGHT - 18));
    website.setAttribute("fill", "#8f8f8f");
    website.setAttribute("font-size", "11");
    website.setAttribute("font-weight", "800");
    website.setAttribute("text-anchor", "end");
    website.textContent = "jobs.monashcoding.com";

    clone.insertBefore(background, clone.firstChild);
    clone.insertBefore(style, clone.firstChild);
    clone.insertBefore(defs, background.nextSibling);
    clone.insertBefore(dotLayer, defs.nextSibling);
    clone.append(title, titleUnderline, brandLogo, brandText, website);

    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    const filename = `${safeFilename(selectedCycle.name)}-pipeline-flow.png`;

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = SANKEY_EXPORT_WIDTH * scale;
      canvas.height = SANKEY_EXPORT_HEIGHT * scale;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      context.fillStyle = "#1a1a1a";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      triggerImageDownload(canvas.toDataURL("image/png"), filename);
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      triggerImageDownload(
        objectUrl,
        `${safeFilename(selectedCycle.name)}-pipeline-flow.svg`,
      );
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };

    image.src = objectUrl;
  }

  if (sessionStatus === "unauthenticated") {
    return <AuthRequiredPanel screen="statistics" />;
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
          <p className="stats-subtitle">{stats.total} applications tracked</p>
        </div>
      </motion.div>

      <div className="stats-primary-grid">
        <motion.section
          className="stats-panel stats-flow-panel stats-flow-panel--primary"
          {...panelMotion}
        >
          <div className="stats-panel-head">
            <div className="stats-flow-title-wrap">
              <div className="stats-flow-title-row">
                <h2>{selectedCycle.name}</h2>
                <div className="stats-tracked-pill">
                  {stats.trackedEvents} tracked move
                  {stats.trackedEvents === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="stats-flow-actions">
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
                className="stats-cycle-select stats-cycle-select--panel"
                style={{ maxWidth: "100%", width: cycleSelectWidth }}
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
              <button
                className="stats-export-button"
                type="button"
                disabled={stats.total === 0}
                onClick={downloadPipelineImage}
              >
                <IconDownload size={15} aria-hidden />
                <span>Export</span>
              </button>
            </div>
          </div>
          <ApplicationSankey
            stats={stats}
            selectedStage={selectedStage}
            onStageSelect={setSelectedStage}
            svgRef={sankeySvgRef}
          />
        </motion.section>

        <motion.div
          className="stats-grid stats-side-table"
          aria-label="Application statistics summary"
          {...panelMotion}
        >
          <StatTile
            label="Total"
            value={stats.total}
            detail={`${stats.reachedApplied} reached Applied`}
            role="neutral"
          />
          <StatTile
            label="Applied"
            value={stats.currentCounts.APPLIED}
            detail="Currently in Applied"
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
            value={formatPercent(stats.rejected, stats.reachedApplied)}
            detail={`${stats.rejected} total rejected`}
            role="loss"
          />
        </motion.div>
      </div>

      <div className="stats-outcome-grid">
        <RejectionSplitPanel stats={stats} />
        <InterviewYieldPanel stats={stats} />
        <OutcomeMixPanel stats={stats} activeCount={activeCount} />
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
