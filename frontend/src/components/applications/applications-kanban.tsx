"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
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
import {
  Button,
  Popover,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconArrowRight,
  IconChevronsDown,
  IconNotes,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import CompanyLogo from "@/components/jobs/company-logo";
import { rolePalette } from "@/lib/role-palette";
import { relativeDate } from "@/lib/utils";
import {
  ApplicationStatus,
  DbApplication,
  UserStage,
} from "@/types/application";
import macSquareLogo from "@/assets/mac-square.png";

export type KanbanSort = "newest" | "oldest";
export type KanbanDensity = "compact" | "detailed";

const VISIBLE_CARDS_PER_COLUMN = 4;

function applicationLogo(app: DbApplication) {
  const isCustomApplication =
    app.jobId.startsWith("custom_") ||
    app.jobSnapshot.jobId.startsWith("custom_");

  return isCustomApplication ? macSquareLogo.src : app.jobSnapshot.logo;
}

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
  onSaveNotes: (jobId: string, notes: string) => Promise<void>;
  onCreateInStage: (
    title: string,
    company: string,
    stageName: string,
    date: string,
  ) => Promise<void>;
  onToggleStar: (appId: string, jobId: string, next: boolean) => void;
  onClearStage: (stageName: string) => Promise<void>;
  density: KanbanDensity;
};

export default function ApplicationsKanban({
  apps,
  stages,
  visibleStageNames,
  sort,
  onStatusChange,
  onDelete,
  onSaveNotes,
  onCreateInStage,
  onToggleStar,
  onClearStage,
  density,
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
        const aS = a.starred ? 1 : 0;
        const bS = b.starred ? 1 : 0;
        if (aS !== bS) return bS - aS;
        const cmp = b.updatedAt.localeCompare(a.updatedAt);
        return sort === "newest" ? cmp : -cmp;
      });
    }
    return map;
  }, [apps, stages, sort]);

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
              onSaveNotes={onSaveNotes}
              onCreateInStage={onCreateInStage}
              onToggleStar={onToggleStar}
              onClearStage={onClearStage}
              density={density}
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
  );
}

export function ApplicationsStatStrip({
  apps,
  stages,
}: {
  apps: DbApplication[];
  stages: UserStage[];
}) {
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
  const totalCount = apps.length;
  const winRate = totalCount > 0 ? Math.round((wins / totalCount) * 100) : 0;

  const cells = [
    { label: "Saved", value: started, sub: "saved", role: "neutral" as const },
    {
      label: "In Progress",
      value: active,
      sub: "pending",
      role: "active" as const,
    },
    {
      label: "Accepted",
      value: wins,
      sub: `${winRate}%`,
      role: "win" as const,
    },
    {
      label: "Rejected",
      value: losses,
      sub: "closed",
      role: "loss" as const,
    },
  ];

  const countsByStage: Record<string, number> = {};
  for (const s of stages) {
    countsByStage[s.name] = apps.filter((a) => a.status === s.name).length;
  }
  const max = Math.max(1, ...stages.map((s) => countsByStage[s.name] ?? 0));

  return (
    <div className="apps-stat-strip">
      {cells.map((c) => {
        const palette = rolePalette(c.role);
        return (
          <div key={c.label} className="apps-stat-cell">
            <div className="apps-stat-label">
              <span
                className="apps-status-dot"
                style={{ background: palette.dot }}
              />
              {c.label}
            </div>
            <div
              className="apps-stat-value"
              style={{ color: palette.solid }}
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
                <span className="apps-mini-bar-count">{count}</span>
                <div
                  className="apps-mini-bar-fill"
                  style={{ height: h, background: palette.dot }}
                />
                <span className="apps-mini-bar-label">{s.displayName}</span>
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
  onSaveNotes,
  onCreateInStage,
  onToggleStar,
  onClearStage,
  density,
}: {
  stage: UserStage;
  apps: DbApplication[];
  onStatusChange: Props["onStatusChange"];
  onDelete: Props["onDelete"];
  onSaveNotes: Props["onSaveNotes"];
  onCreateInStage: Props["onCreateInStage"];
  onToggleStar: Props["onToggleStar"];
  onClearStage: Props["onClearStage"];
  density: KanbanDensity;
}) {
  const palette = rolePalette(stage.colorRole);
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${stage.name}`,
    data: { stageName: stage.name },
  });

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasHiddenApps = apps.length > VISIBLE_CARDS_PER_COLUMN;
  const visibleApps = expanded
    ? apps
    : apps.slice(0, VISIBLE_CARDS_PER_COLUMN);
  const hiddenCount = apps.length - visibleApps.length;

  async function confirmClear() {
    setClearing(true);
    try {
      await onClearStage(stage.name);
      setClearOpen(false);
    } finally {
      setClearing(false);
    }
  }

  function reset() {
    setTitle("");
    setCompany("");
    setDate(new Date().toISOString().slice(0, 10));
  }

  async function submit() {
    if (!title.trim() || !company.trim()) return;
    setCreating(true);
    try {
      await onCreateInStage(title.trim(), company.trim(), stage.name, date);
      reset();
      setAddOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={"apps-kanban-col" + (isOver ? " is-drop-target" : "")}
      style={{ borderTop: `3px solid ${palette.dot}` }}
    >
      <header className="apps-kc-col-head">
        <div className="apps-kc-col-head-left">
          <span className="apps-kc-col-name">{stage.displayName}</span>
          <span
            className="apps-count-pill"
            style={{ background: palette.pillBg, color: palette.pillFg }}
          >
            {apps.length}
          </span>
        </div>
        <div className="apps-kc-col-head-actions">
        {apps.length > 0 && (
          <Popover
            opened={clearOpen}
            onChange={setClearOpen}
            position="bottom-end"
            shadow="md"
            withinPortal
            trapFocus
          >
            <Popover.Target>
              <button
                type="button"
                className="apps-icon-btn"
                aria-label={`Clear ${stage.displayName}`}
                title={`Clear ${stage.displayName}`}
                onClick={() => setClearOpen((o) => !o)}
              >
                <IconTrash size={14} />
              </button>
            </Popover.Target>
            <Popover.Dropdown
              style={{
                backgroundColor: "#2e2e2e",
                border: "2px solid #3a3a3a",
                borderRadius: "0.65rem",
                padding: 12,
                width: 240,
              }}
            >
              <Stack gap="xs">
                <div style={{ color: "white", fontSize: 13 }}>
                  Clear {apps.length} application{apps.length === 1 ? "" : "s"} in {stage.displayName}?
                </div>
                <Button
                  size="xs"
                  fullWidth
                  loading={clearing}
                  onClick={confirmClear}
                  style={{
                    backgroundColor: "#e03131",
                    color: "white",
                    borderRadius: "0.5rem",
                    fontWeight: 700,
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="xs"
                  fullWidth
                  variant="subtle"
                  onClick={() => setClearOpen(false)}
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        <Popover
          opened={addOpen}
          onChange={setAddOpen}
          position="bottom-end"
          shadow="md"
          withinPortal
          trapFocus
        >
          <Popover.Target>
            <button
              type="button"
              className="apps-icon-btn"
              aria-label={`Add to ${stage.displayName}`}
              title={`Add to ${stage.displayName}`}
              onClick={() => setAddOpen((o) => !o)}
            >
              <IconPlus size={14} />
            </button>
          </Popover.Target>
          <Popover.Dropdown
            style={{
              backgroundColor: "#2e2e2e",
              border: "2px solid #3a3a3a",
              borderRadius: "0.65rem",
              padding: 12,
              width: 260,
            }}
          >
            <Stack gap="xs">
              <TextInput
                size="xs"
                placeholder="Role"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                }}
              />
              <TextInput
                size="xs"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                  },
                }}
              />
              <TextInput
                size="xs"
                type="date"
                value={date}
                onChange={(e) => setDate(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#3a3a3a",
                    border: "none",
                    borderRadius: "0.4rem",
                    color: "white",
                    colorScheme: "dark",
                  } as React.CSSProperties,
                }}
              />
              <Button
                size="xs"
                fullWidth
                loading={creating}
                disabled={!title.trim() || !company.trim()}
                onClick={submit}
                style={{
                  backgroundColor: "#ffe22f",
                  color: "#1f1f1f",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                }}
              >
                Add to {stage.displayName}
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
        </div>
      </header>
      <div className="apps-kc-col-body">
        {apps.length === 0 ? (
          <div className="apps-kc-col-empty">
            No {stage.displayName.toLowerCase()}
          </div>
        ) : (
          visibleApps.map((a) => (
            <KanbanCard
              key={a._id}
              app={a}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onSaveNotes={onSaveNotes}
              onToggleStar={onToggleStar}
              density={density}
            />
          ))
        )}
        {hasHiddenApps && !expanded && (
          <button
            type="button"
            className="apps-kc-show-more"
            aria-label={`Show ${hiddenCount} more application${hiddenCount === 1 ? "" : "s"} in ${stage.displayName}`}
            onClick={() => setExpanded(true)}
          >
            <span>Show More</span>
            <IconChevronsDown size={16} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  app,
  onStatusChange,
  onDelete,
  onSaveNotes,
  onToggleStar,
  density,
}: {
  app: DbApplication;
  onStatusChange: Props["onStatusChange"];
  onDelete: Props["onDelete"];
  onSaveNotes: Props["onSaveNotes"];
  onToggleStar: Props["onToggleStar"];
  density: KanbanDensity;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app._id, data: { status: app.status } });

  const style: CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  const url = app.jobSnapshot.applicationUrl;

  const [notesOpen, setNotesOpen] = useState(false);
  const [draft, setDraft] = useState(app.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!notesOpen) setDraft(app.notes ?? "");
  }, [app.notes, notesOpen]);

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await onSaveNotes(app.jobId, draft);
      setNotesOpen(false);
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <article
      ref={setNodeRef}
      className={
        "apps-kanban-card" +
        (app.status === "STARTED" ? " has-started-action" : "") +
        (density === "compact" ? " apps-kanban-card--compact" : "") +
        (isDragging ? " is-dragging" : "")
      }
      style={style}
      onClick={() => url && window.open(url, "_blank", "noreferrer")}
      {...attributes}
      {...listeners}
    >
      <header className="apps-kc-head">
        <CompanyLogo
          name={app.jobSnapshot.companyName}
          logo={applicationLogo(app)}
          applicationUrl={app.jobSnapshot.applicationUrl}
          className="h-7 w-7 flex-shrink-0"
        />
        <div className="apps-kc-head-text">
          <div className="apps-kc-company">{app.jobSnapshot.companyName}</div>
        </div>
      </header>
      <h3 className="apps-kc-role">{app.jobSnapshot.title}</h3>
      <footer className="apps-kc-foot">
        <span className="apps-kc-foot-meta">{relativeDate(app.updatedAt)}</span>
        <div className="apps-kc-foot-icons">
          <button
            type="button"
            className={"apps-icon-btn" + (app.starred ? " is-starred" : "")}
            aria-label={app.starred ? "Unstar" : "Star"}
            title={app.starred ? "Unstar" : "Star"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(app._id, app.jobId, !app.starred);
            }}
          >
            {app.starred ? (
              <IconStarFilled size={14} />
            ) : (
              <IconStar size={14} />
            )}
          </button>
          <Popover
            opened={notesOpen}
            onChange={setNotesOpen}
            position="bottom-end"
            shadow="md"
            withinPortal
            trapFocus
          >
            <Popover.Target>
              <button
                type="button"
                className={"apps-icon-btn" + (app.notes ? " has-notes" : "")}
                aria-label={app.notes ? "Edit notes" : "Add notes"}
                title={app.notes ? "Edit notes" : "Add notes"}
                onClick={(e) => {
                  e.stopPropagation();
                  setNotesOpen((o) => !o);
                }}
              >
                <IconNotes size={14} />
              </button>
            </Popover.Target>
            <Popover.Dropdown
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#2e2e2e",
                border: "2px solid #3a3a3a",
                borderRadius: "0.65rem",
                padding: 10,
                width: 280,
              }}
            >
              <Stack gap="xs">
                <Textarea
                  autosize
                  minRows={4}
                  maxRows={10}
                  placeholder="Interview prep, recruiter, salary…"
                  value={draft}
                  onChange={(e) => setDraft(e.currentTarget.value)}
                  styles={{
                    input: {
                      backgroundColor: "#3a3a3a",
                      border: "none",
                      borderRadius: "0.4rem",
                      color: "white",
                      fontSize: 13,
                    },
                  }}
                />
                <Button
                  size="xs"
                  fullWidth
                  loading={savingNotes}
                  onClick={saveNotes}
                  style={{
                    backgroundColor: "#ffe22f",
                    color: "#1f1f1f",
                    borderRadius: "0.5rem",
                    fontWeight: 700,
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
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
      {app.status === "STARTED" && (
        <button
          type="button"
          className="apps-started-action"
          aria-label="Mark as applied"
          title="Mark as applied"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(app._id, app.jobId, "STARTED", "APPLIED");
          }}
        >
          <IconArrowRight size={15} />
        </button>
      )}
    </article>
  );
}

function DragPreview({ app }: { app: DbApplication }) {
  return (
    <div className="apps-drag-preview">
      <div className="apps-kc-head" style={{ marginBottom: 8 }}>
        <CompanyLogo
          name={app.jobSnapshot.companyName}
          logo={applicationLogo(app)}
          applicationUrl={app.jobSnapshot.applicationUrl}
          className="h-7 w-7 flex-shrink-0"
        />
        <div className="apps-kc-head-text">
          <div className="apps-kc-company">{app.jobSnapshot.companyName}</div>
        </div>
      </div>
      <h3 className="apps-kc-role">{app.jobSnapshot.title}</h3>
    </div>
  );
}
