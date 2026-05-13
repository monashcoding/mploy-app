"use client";

import { useMemo, useState } from "react";
import { Menu } from "@mantine/core";
import { IconCheck, IconExternalLink, IconNotes } from "@tabler/icons-react";
import CompanyLogo from "@/components/jobs/company-logo";
import { rolePalette } from "@/lib/role-palette";
import { formatISODate, relativeDate } from "@/lib/utils";
import {
  ApplicationStatus,
  DbApplication,
  UserStage,
} from "@/types/application";

function weekBucket(iso: string) {
  const today = new Date();
  const d = new Date(iso);
  const days = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (days <= 2) return "This week";
  if (days <= 9) return "Last week";
  if (days <= 30) return "Earlier this month";
  const month = d.toLocaleString("en-US", { month: "long" });
  return month;
}

const STAGE_VERB: Record<string, string> = {
  STARTED: "Drafted application for",
  APPLIED: "Applied to",
  INTERVIEW: "Interviewed with",
  ACCEPTED: "Received offer from",
  REJECTED: "Rejected by",
};

type Props = {
  apps: DbApplication[];
  stages: UserStage[];
  onStatusChange: (
    appId: string,
    jobId: string,
    oldStatus: ApplicationStatus,
    next: ApplicationStatus,
  ) => Promise<void>;
  onOpenNotes: (appId: string) => void;
};

export default function ApplicationsTimeline({
  apps,
  stages,
  onStatusChange,
  onOpenNotes,
}: Props) {
  const { groups, order } = useMemo(() => {
    const sorted = [...apps].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    const groups: Record<string, DbApplication[]> = {};
    const order: string[] = [];
    for (const app of sorted) {
      const key = weekBucket(app.updatedAt);
      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(app);
    }
    return { groups, order };
  }, [apps]);

  const total = apps.length;
  const wins = apps.filter(
    (a) => stages.find((s) => s.name === a.status)?.colorRole === "win",
  ).length;
  const losses = apps.filter(
    (a) => stages.find((s) => s.name === a.status)?.colorRole === "loss",
  ).length;
  const active = apps.filter((a) => {
    const s = stages.find((st) => st.name === a.status);
    return s?.colorRole === "active";
  }).length;

  return (
    <div className="apps-tl-layout">
      <main className="apps-tl-main">
        {order.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              border: "1px dashed var(--border)",
              borderRadius: "0.75rem",
            }}
          >
            No applications yet.
          </div>
        ) : (
          order.map((g) => (
            <section key={g}>
              <header className="apps-tl-group-head">
                <h2>{g}</h2>
                <span className="apps-tl-group-count">
                  {groups[g].length}{" "}
                  {groups[g].length === 1 ? "event" : "events"}
                </span>
              </header>
              <div className="apps-tl-list">
                {groups[g].map((app) => (
                  <TimelineItem
                    key={app._id}
                    app={app}
                    stages={stages}
                    onStatusChange={onStatusChange}
                    onOpenNotes={onOpenNotes}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <aside className="apps-tl-rail">
        <div className="apps-tl-rail-card">
          <header className="apps-tl-rail-head">Pipeline</header>
          <VerticalSankey apps={apps} stages={stages} />
        </div>
        <div className="apps-tl-rail-card apps-tl-rail-stats">
          <div className="apps-tl-stat">
            <div className="apps-tl-stat-label">Total tracked</div>
            <div className="apps-tl-stat-value">{total}</div>
          </div>
          <div className="apps-tl-stat-row">
            <div className="apps-tl-stat">
              <div
                className="apps-tl-stat-label"
                style={{ color: "#ffe96b" }}
              >
                ● Active
              </div>
              <div className="apps-tl-stat-value">{active}</div>
            </div>
            <div className="apps-tl-stat">
              <div
                className="apps-tl-stat-label"
                style={{ color: "#b9e8c6" }}
              >
                ● Wins
              </div>
              <div className="apps-tl-stat-value">{wins}</div>
            </div>
            <div className="apps-tl-stat">
              <div
                className="apps-tl-stat-label"
                style={{ color: "#ff9275" }}
              >
                ● Losses
              </div>
              <div className="apps-tl-stat-value">{losses}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TimelineItem({
  app,
  stages,
  onStatusChange,
  onOpenNotes,
}: {
  app: DbApplication;
  stages: UserStage[];
  onStatusChange: Props["onStatusChange"];
  onOpenNotes: Props["onOpenNotes"];
}) {
  const [hover, setHover] = useState(false);
  const stage = stages.find((s) => s.name === app.status);
  if (!stage) return null;
  const palette = rolePalette(stage.colorRole);
  const verb = STAGE_VERB[app.status] ?? `Moved to ${stage.displayName}`;
  const url = app.jobSnapshot.applicationUrl;

  return (
    <div
      className="apps-tl-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="apps-tl-spine">
        <span
          className="apps-tl-dot"
          style={{
            background: palette.dot,
            boxShadow: `0 0 0 4px ${palette.pillBg}`,
          }}
        />
      </div>
      <div className="apps-tl-card">
        <div className="apps-tl-card-head">
          <span className="apps-tl-verb">{verb}</span>
          <CompanyLogo
            name={app.jobSnapshot.companyName}
            logo={app.jobSnapshot.logo}
            applicationUrl={app.jobSnapshot.applicationUrl}
            className="h-[22px] w-[22px] flex-shrink-0"
          />
          <span className="apps-tl-company">{app.jobSnapshot.companyName}</span>
          <span className="apps-tl-date">
            {relativeDate(app.updatedAt)} · {formatISODate(app.updatedAt)}
          </span>
        </div>
        <h3 className="apps-tl-role">{app.jobSnapshot.title}</h3>
        <div className="apps-tl-card-foot">
          <Menu position="bottom-start" shadow="md" withinPortal>
            <Menu.Target>
              <button
                type="button"
                className="apps-tl-status-pill"
                style={{
                  background: palette.pillBg,
                  color: palette.pillFg,
                }}
              >
                <span
                  className="apps-status-dot"
                  style={{ background: palette.dot }}
                />
                {stage.displayName}
              </button>
            </Menu.Target>
            <Menu.Dropdown
              style={{
                backgroundColor: "#2e2e2e",
                border: "2px solid #3a3a3a",
                borderRadius: "0.75rem",
              }}
            >
              {stages.map((s) => {
                const p = rolePalette(s.colorRole);
                return (
                  <Menu.Item
                    key={s.id}
                    leftSection={
                      <span
                        className="apps-status-dot"
                        style={{ background: p.dot }}
                      />
                    }
                    onClick={() =>
                      onStatusChange(app._id, app.jobId, app.status, s.name)
                    }
                  >
                    {s.displayName}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
          {app.notes && (
            <button
              type="button"
              className="apps-tl-notes"
              onClick={() => onOpenNotes(app._id)}
            >
              <IconNotes size={13} color="#ffe22f" />
              <span>Notes</span>
              {hover && (
                <div className="apps-notes-pop apps-notes-pop-tl">
                  <div className="apps-notes-pop-label">NOTES</div>
                  <div className="apps-notes-pop-body">{app.notes}</div>
                </div>
              )}
            </button>
          )}
          {app.status === "STARTED" && (
            <button
              type="button"
              className="apps-quick-applied"
              onClick={() =>
                onStatusChange(app._id, app.jobId, "STARTED", "APPLIED")
              }
            >
              Mark Applied <IconCheck size={12} />
            </button>
          )}
          {!app.notes && (
            <button
              type="button"
              className="apps-tl-notes"
              onClick={() => onOpenNotes(app._id)}
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <IconNotes size={13} color="rgba(255,255,255,0.5)" />
              <span>Add notes</span>
            </button>
          )}
          <span className="apps-tl-spacer" />
          {url && (
            <button
              type="button"
              className="apps-icon-btn"
              aria-label="Open job"
              onClick={() => window.open(url, "_blank", "noreferrer")}
            >
              <IconExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VerticalSankey({
  apps,
  stages,
}: {
  apps: DbApplication[];
  stages: UserStage[];
}) {
  const counts = stages.map(
    (s) => apps.filter((a) => a.status === s.name).length,
  );
  const W = 280;
  const H = 480;
  const padX = 28;
  const padY = 18;
  const slotH = (H - padY * 2) / Math.max(stages.length, 1);
  const maxCount = Math.max(1, ...counts);
  const widthFor = (c: number) =>
    30 + (W - padX * 2 - 30) * (c / maxCount);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="apps-vsankey-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {stages.slice(0, -1).map((s, i) => {
          const a = rolePalette(s.colorRole).dot;
          const b = rolePalette(stages[i + 1].colorRole).dot;
          return (
            <linearGradient
              key={s.id}
              id={`apps-vg${i}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor={a} stopOpacity="0.5" />
              <stop offset="100%" stopColor={b} stopOpacity="0.5" />
            </linearGradient>
          );
        })}
      </defs>
      {stages.slice(0, -1).map((s, i) => {
        const cx = W / 2;
        const y1 = padY + slotH * i + slotH * 0.6;
        const y2 = padY + slotH * (i + 1) + slotH * 0.4;
        const w1 = widthFor(counts[i]) / 2;
        const w2 = widthFor(counts[i + 1]) / 2;
        const ymid = (y1 + y2) / 2;
        const d = `M ${cx - w1} ${y1} C ${cx - w1} ${ymid} ${cx - w2} ${ymid} ${cx - w2} ${y2} L ${cx + w2} ${y2} C ${cx + w2} ${ymid} ${cx + w1} ${ymid} ${cx + w1} ${y1} Z`;
        return <path key={s.id} d={d} fill={`url(#apps-vg${i})`} />;
      })}
      {stages.map((s, i) => {
        const palette = rolePalette(s.colorRole);
        const y = padY + slotH * i + slotH * 0.5;
        const w = widthFor(counts[i]);
        return (
          <g key={s.id}>
            <rect
              x={W / 2 - w / 2}
              y={y - 14}
              width={w}
              height={28}
              rx={14}
              fill={palette.dot}
            />
            <text
              x={W / 2}
              y={y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill="#1f1f1f"
            >
              {s.displayName} · {counts[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
