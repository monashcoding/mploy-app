"use client";

import { CSSProperties, useMemo, useState } from "react";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useDraggable } from "@dnd-kit/core";
import { IconCheck, IconNotes, IconTrash } from "@tabler/icons-react";
import CompanyLogo from "@/components/jobs/company-logo";
import { rolePalette } from "@/lib/role-palette";
import { relativeDate } from "@/lib/utils";
import {
  ApplicationStatus,
  DbApplication,
  UserStage,
} from "@/types/application";

export type KanbanSort = "newest" | "oldest";

const cursorCollisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return rectIntersection(args);
};

type Props = {
  apps: DbApplication[];
  stages: UserStage[];
  visibleStageNames: string[];
  sort: KanbanSort;
  onStatusChange: (
    appId: string,
    jobId: string,
    oldStatus: ApplicationStatus,
    next: ApplicationStatus,
  ) => Promise<void>;
  onDelete: (appId: string, jobId: string) => void;
  onOpenNotes: (appId: string) => void;
};

export default function ApplicationsKanban({
  apps,
  stages,
  visibleStageNames,
  sort,
  onStatusChange,
  onDelete,
  onOpenNotes,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, DbApplication[]>();
    for (const s of stages) map.set(s.name, []);
    for (const a of apps) {
      const arr = map.get(a.status);
      if (arr) arr.push(a);
      else {
        const first = stages[0]?.name;
        if (first) map.get(first)?.push(a);
      }
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const cmp = b.updatedAt.localeCompare(a.updatedAt);
        return sort === "newest" ? cmp : -cmp;
      });
    }
    return map;
  }, [apps, stages, sort]);

  const totalCount = apps.length;
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
  const started = apps.filter((a) => a.status === "STARTED").length;
  const winRate = totalCount > 0 ? Math.round((wins / totalCount) * 100) : 0;

  const statCells = [
    { label: "Total", value: totalCount, sub: "tracked" },
    {
      label: "Active",
      value: active,
      sub: "in flight",
      role: "active" as const,
    },
    {
      label: "Wins",
      value: wins,
      sub: `${winRate}% rate`,
      role: "win" as const,
    },
    {
      label: "Losses",
      value: losses,
      sub: "rejected",
      role: "loss" as const,
    },
    {
      label: "Drafted",
      value: started,
      sub: "not yet sent",
      role: "neutral" as const,
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overId = String(over.id);

    const sourceApp = apps.find((a) => a._id === activeIdStr);
    if (!sourceApp) return;
    const sourceStage = sourceApp.status;

    let targetStage: string | null = null;

    if (overId.startsWith("col:")) {
      targetStage = overId.slice("col:".length);
    } else {
      const targetApp = apps.find((a) => a._id === overId);
      if (!targetApp) return;
      targetStage = targetApp.status;
    }
    if (!targetStage) return;
    if (sourceStage === targetStage) return;

    await onStatusChange(
      sourceApp._id,
      sourceApp.jobId,
      sourceStage,
      targetStage as ApplicationStatus,
    );
  }

  const activeApp = activeId
    ? apps.find((a) => a._id === activeId) ?? null
    : null;

  const visibleStages = stages.filter((s) =>
    visibleStageNames.includes(s.name),
  );

  return (
    <div>
      <StatStrip
        cells={statCells}
        stages={stages}
        countsByStage={Object.fromEntries(
          stages.map((s) => [s.name, (grouped.get(s.name) ?? []).length]),
        )}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={cursorCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="apps-kanban-board">
          {visibleStages.map((stage) => {
            const stageApps = grouped.get(stage.name) ?? [];
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                apps={stageApps}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onOpenNotes={onOpenNotes}
              />
            );
          })}
        </div>
        <DragOverlay
          modifiers={[snapCenterToCursor]}
          dropAnimation={{ duration: 180, easing: "ease" }}
        >
          {activeApp ? <DragPreview app={activeApp} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function StatStrip({
  cells,
  stages,
  countsByStage,
}: {
  cells: Array<{
    label: string;
    value: number;
    sub: string;
    role?: "neutral" | "active" | "win" | "loss";
  }>;
  stages: UserStage[];
  countsByStage: Record<string, number>;
}) {
  const max = Math.max(1, ...stages.map((s) => countsByStage[s.name] ?? 0));
  return (
    <div className="apps-stat-strip">
      {cells.map((c) => {
        const palette = c.role ? rolePalette(c.role) : null;
        return (
          <div key={c.label} className="apps-stat-cell">
            <div className="apps-stat-label">
              {palette && (
                <span
                  className="apps-status-dot"
                  style={{ background: palette.dot }}
                />
              )}
              {c.label}
            </div>
            <div
              className="apps-stat-value"
              style={palette ? { color: palette.solid } : undefined}
            >
              {c.value}
            </div>
            <div className="apps-stat-sub">{c.sub}</div>
          </div>
        );
      })}
      <div className="apps-stat-cell apps-stat-spark">
        <div className="apps-stat-label">Pipeline</div>
        <div className="apps-mini-bars">
          {stages.map((s) => {
            const count = countsByStage[s.name] ?? 0;
            const palette = rolePalette(s.colorRole);
            const h = 4 + (count / max) * 28;
            return (
              <div
                key={s.id}
                className="apps-mini-bar"
                title={`${s.displayName}: ${count}`}
              >
                <div
                  className="apps-mini-bar-fill"
                  style={{ height: h, background: palette.dot }}
                />
                <span className="apps-mini-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  apps,
  onStatusChange,
  onDelete,
  onOpenNotes,
}: {
  stage: UserStage;
  apps: DbApplication[];
  onStatusChange: Props["onStatusChange"];
  onDelete: Props["onDelete"];
  onOpenNotes: Props["onOpenNotes"];
}) {
  const palette = rolePalette(stage.colorRole);
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${stage.name}`,
    data: { stageName: stage.name },
  });

  return (
    <div
      ref={setNodeRef}
      className={"apps-kanban-col" + (isOver ? " is-drop-target" : "")}
    >
      <header className="apps-kc-col-head">
        <div className="apps-kc-col-head-left">
          <span
            className="apps-status-dot"
            style={{ background: palette.dot, width: 9, height: 9 }}
          />
          <span className="apps-kc-col-name">{stage.displayName}</span>
          <span
            className="apps-count-pill"
            style={{ background: palette.pillBg, color: palette.pillFg }}
          >
            {apps.length}
          </span>
        </div>
      </header>
      <div className="apps-kc-col-body">
        {apps.length === 0 ? (
          <div className="apps-kc-col-empty">
            No {stage.displayName.toLowerCase()}
          </div>
        ) : (
          apps.map((a) => (
            <KanbanCard
              key={a._id}
              app={a}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onOpenNotes={onOpenNotes}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  app,
  onStatusChange,
  onDelete,
  onOpenNotes,
}: {
  app: DbApplication;
  onStatusChange: Props["onStatusChange"];
  onDelete: Props["onDelete"];
  onOpenNotes: Props["onOpenNotes"];
}) {
  const [hover, setHover] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app._id, data: { status: app.status } });

  const style: CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  const url = app.jobSnapshot.applicationUrl;

  return (
    <article
      ref={setNodeRef}
      className={"apps-kanban-card" + (isDragging ? " is-dragging" : "")}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => url && window.open(url, "_blank", "noreferrer")}
      {...attributes}
      {...listeners}
    >
      <header className="apps-kc-head">
        <CompanyLogo
          name={app.jobSnapshot.companyName}
          logo={app.jobSnapshot.logo}
          applicationUrl={app.jobSnapshot.applicationUrl}
          className="h-7 w-7 flex-shrink-0"
        />
        <div className="apps-kc-head-text">
          <div className="apps-kc-company">{app.jobSnapshot.companyName}</div>
          <div className="apps-kc-date">{relativeDate(app.updatedAt)}</div>
        </div>
      </header>
      <h3 className="apps-kc-role">{app.jobSnapshot.title}</h3>
      <footer className="apps-kc-foot">
        {app.status === "STARTED" ? (
          <button
            type="button"
            className="apps-quick-applied"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(app._id, app.jobId, "STARTED", "APPLIED");
            }}
          >
            Mark Applied <IconCheck size={12} />
          </button>
        ) : (
          <span className="apps-kc-foot-meta">
            {relativeDate(app.updatedAt)}
          </span>
        )}
        <div className="apps-kc-foot-icons">
          <button
            type="button"
            className={"apps-icon-btn" + (app.notes ? " has-notes" : "")}
            aria-label={app.notes ? "Edit notes" : "Add notes"}
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotes(app._id);
            }}
          >
            <IconNotes size={14} />
            {app.notes && hover && (
              <div className="apps-notes-pop">
                <div className="apps-notes-pop-label">NOTES</div>
                <div className="apps-notes-pop-body">{app.notes}</div>
              </div>
            )}
          </button>
          <button
            type="button"
            className="apps-icon-btn"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app._id, app.jobId);
            }}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function DragPreview({ app }: { app: DbApplication }) {
  return (
    <div className="apps-drag-preview">
      <div className="apps-kc-head" style={{ marginBottom: 8 }}>
        <CompanyLogo
          name={app.jobSnapshot.companyName}
          logo={app.jobSnapshot.logo}
          applicationUrl={app.jobSnapshot.applicationUrl}
          className="h-7 w-7 flex-shrink-0"
        />
        <div className="apps-kc-head-text">
          <div className="apps-kc-company">{app.jobSnapshot.companyName}</div>
          <div className="apps-kc-date">{relativeDate(app.updatedAt)}</div>
        </div>
      </div>
      <h3 className="apps-kc-role">{app.jobSnapshot.title}</h3>
    </div>
  );
}
