"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  IconChevronsUp,
  IconGripVertical,
  IconNotes,
  IconPlus,
  IconRefresh,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import ApplicationDatePicker, {
  formatApplicationDateValue,
} from "@/components/applications/application-date-picker";
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
const COMPACT_VISIBLE_CARDS_PER_COLUMN = 8;

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
  onStageReorder: (activeStageName: string, targetStageName: string) => void;
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
  onStageReorder,
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
    const activeType = e.active.data.current?.type;
    setActiveId(activeType === "app" ? String(e.active.id) : null);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overId = String(over.id);
    const activeType = active.data.current?.type;

    if (activeType === "stage") {
      const sourceStage = active.data.current?.stageName;
      const targetStage = overId.startsWith("col:")
        ? overId.slice("col:".length)
        : null;

      if (
        typeof sourceStage === "string" &&
        targetStage &&
        sourceStage !== targetStage
      ) {
        onStageReorder(sourceStage, targetStage);
      }
      return;
    }

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
  const lossRate =
    totalCount > 0 ? Math.round((losses / totalCount) * 100) : 0;

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
      sub: `${lossRate}%`,
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
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `col:${stage.name}`,
    data: { stageName: stage.name },
  });
  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setDragNodeRef,
    transform: columnTransform,
    isDragging: isColumnDragging,
  } = useDraggable({
    id: `stage:${stage.name}`,
    data: { type: "stage", stageName: stage.name },
  });

  const setColumnNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDropNodeRef(node);
      setDragNodeRef(node);
    },
    [setDragNodeRef, setDropNodeRef],
  );

  const columnStyle: CSSProperties = {
    borderTop: `3px solid ${palette.dot}`,
    ...(columnTransform
      ? {
          transform: `translate3d(${columnTransform.x}px, ${columnTransform.y}px, 0)`,
        }
      : {}),
  };

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(formatApplicationDateValue);
  const [creating, setCreating] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleCardLimit =
    density === "compact"
      ? COMPACT_VISIBLE_CARDS_PER_COLUMN
      : VISIBLE_CARDS_PER_COLUMN;
  const hasHiddenApps = apps.length > visibleCardLimit;
  const visibleApps = expanded ? apps : apps.slice(0, visibleCardLimit);
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
    setDate(formatApplicationDateValue());
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
      ref={setColumnNodeRef}
      className={
        "apps-kanban-col" +
        (isOver ? " is-drop-target" : "") +
        (isColumnDragging ? " is-column-dragging" : "")
      }
      style={columnStyle}
    >
      <header className="apps-kc-col-head">
        <div className="apps-kc-col-head-left">
          <button
            type="button"
            className="apps-kc-col-drag"
            aria-label={`Move ${stage.displayName} column`}
            title={`Move ${stage.displayName} column`}
            {...columnAttributes}
            {...columnListeners}
          >
            <IconGripVertical size={15} />
          </button>
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
                <IconRefresh size={14} />
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
              <ApplicationDatePicker
                value={date}
                onChange={setDate}
                ariaLabel={`Application date for ${stage.displayName}`}
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
        {hasHiddenApps && (
          <button
            type="button"
            className="apps-kc-show-more"
            aria-label={
              expanded
                ? `Show fewer applications in ${stage.displayName}`
                : `Show ${hiddenCount} more application${hiddenCount === 1 ? "" : "s"} in ${stage.displayName}`
            }
            onClick={() => setExpanded((value) => !value)}
          >
            <span>{expanded ? "Show Less" : "Show More"}</span>
            {expanded ? (
              <IconChevronsUp size={16} aria-hidden />
            ) : (
              <IconChevronsDown size={16} aria-hidden />
            )}
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
    useDraggable({ id: app._id, data: { type: "app", status: app.status } });

  const style: CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  const url = app.jobSnapshot.applicationUrl;

  const [notesOpen, setNotesOpen] = useState(false);
  const [draft, setDraft] = useState(app.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesPosition, setNotesPosition] = useState<CSSProperties | null>(
    null,
  );
  const cardRef = useRef<HTMLElement | null>(null);
  const notesEditorRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  const lastSavedNotesRef = useRef(app.notes ?? "");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCardNodeRef = useCallback(
    (node: HTMLElement | null) => {
      cardRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const nextNotes = app.notes ?? "";
    lastSavedNotesRef.current = nextNotes;
    if (!notesOpen) setDraft(nextNotes);
  }, [app.notes, notesOpen]);

  const saveNotesNow = useCallback(
    async (nextNotes: string) => {
      const persistedNotes = nextNotes.trim().length > 0 ? nextNotes : "";
      if (persistedNotes === lastSavedNotesRef.current) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      lastSavedNotesRef.current = persistedNotes;
      setSavingNotes(true);
      try {
        await onSaveNotes(app.jobId, persistedNotes);
      } catch {
        lastSavedNotesRef.current = app.notes ?? "";
      } finally {
        setSavingNotes(false);
      }
    },
    [app.jobId, app.notes, onSaveNotes],
  );

  const updateNotesPosition = useCallback(() => {
    const card = cardRef.current;
    const editor = notesEditorRef.current;
    if (!card || !editor) return;

    const gap = 10;
    const margin = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardRect = card.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const editorWidth =
      editorRect.width || Math.min(360, viewportWidth - margin * 2);
    const editorHeight = editorRect.height || 240;
    const maxLeft = Math.max(margin, viewportWidth - editorWidth - margin);
    const maxTop = Math.max(margin, viewportHeight - editorHeight - margin);
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    let top = clamp(cardRect.top, margin, maxTop);
    let left = cardRect.right + gap;
    const canFitRight =
      cardRect.right + gap + editorWidth <= viewportWidth - margin;
    const canFitLeft = cardRect.left - gap - editorWidth >= margin;

    if (!canFitRight && canFitLeft) {
      left = cardRect.left - editorWidth - gap;
    } else if (!canFitRight) {
      left = clamp(
        cardRect.left + cardRect.width / 2 - editorWidth / 2,
        margin,
        maxLeft,
      );
      top = cardRect.bottom + gap;
      if (top + editorHeight > viewportHeight - margin) {
        top = cardRect.top - editorHeight - gap;
      }
      top = clamp(top, margin, maxTop);
    }

    setNotesPosition({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!notesOpen) {
      setNotesPosition(null);
      return;
    }

    updateNotesPosition();
    window.addEventListener("resize", updateNotesPosition);
    window.addEventListener("scroll", updateNotesPosition, true);

    return () => {
      window.removeEventListener("resize", updateNotesPosition);
      window.removeEventListener("scroll", updateNotesPosition, true);
    };
  }, [notesOpen, updateNotesPosition]);

  useEffect(() => {
    if (!notesOpen) return;
    const persistedDraft = draft.trim().length > 0 ? draft : "";
    if (persistedDraft === lastSavedNotesRef.current) return;

    const timer = setTimeout(() => {
      void saveNotesNow(draft);
    }, 600);

    saveTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      if (saveTimerRef.current === timer) saveTimerRef.current = null;
    };
  }, [draft, notesOpen, saveNotesNow]);

  useEffect(() => {
    if (!notesOpen) return;

    const closeNotes = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      void saveNotesNow(draftRef.current);
      setNotesOpen(false);
    };

    const closeOnOutsideInteraction = (event: Event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        notesEditorRef.current?.contains(target)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const nativeEvent = event as Event & {
        stopImmediatePropagation?: () => void;
      };
      nativeEvent.stopImmediatePropagation?.();
      closeNotes();
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      event.stopPropagation();
      closeNotes();
    };

    const blockedEvents = [
      "pointerdown",
      "mousedown",
      "click",
      "dblclick",
      "contextmenu",
      "dragstart",
    ];

    blockedEvents.forEach((eventName) => {
      document.addEventListener(eventName, closeOnOutsideInteraction, true);
    });
    document.addEventListener("keydown", closeOnEscape, true);

    return () => {
      blockedEvents.forEach((eventName) => {
        document.removeEventListener(
          eventName,
          closeOnOutsideInteraction,
          true,
        );
      });
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [notesOpen, saveNotesNow]);

  const dateLabel = relativeDate(app.updatedAt).toUpperCase();

  return (
    <article
      ref={setCardNodeRef}
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
      <div className="apps-kc-role-wrap">
        <span className="apps-card-drag-grip" aria-hidden="true">
          <IconGripVertical size={14} />
        </span>
        <h3 className="apps-kc-role">{app.jobSnapshot.title}</h3>
      </div>
      <footer className="apps-kc-foot">
        <span className="apps-kc-foot-meta">{dateLabel}</span>
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
          <button
            type="button"
            className={"apps-icon-btn" + (app.notes ? " has-notes" : "")}
            aria-label={app.notes ? "Edit notes" : "Add notes"}
            title={app.notes ? "Edit notes" : "Add notes"}
            onClick={(e) => {
              e.stopPropagation();
              setNotesPosition(null);
              setNotesOpen(true);
            }}
          >
            <IconNotes size={14} />
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
      {notesOpen && (
        <div
          ref={notesEditorRef}
          className="apps-notes-editor"
          data-apps-note-editor={app._id}
          style={notesPosition ?? { visibility: "hidden" }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="apps-notes-editor-head">
            <div>
              <span className="apps-notes-editor-label">Notes</span>
              <div className="apps-notes-editor-title">
                {app.jobSnapshot.title}
              </div>
            </div>
            <span className="apps-notes-editor-status">
              {savingNotes ? "Saving..." : "Auto-saved"}
            </span>
          </div>
          <Stack gap="xs">
            <Textarea
              autosize
              minRows={5}
              maxRows={10}
              placeholder="Interview prep, recruiter, salary..."
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
          </Stack>
        </div>
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
