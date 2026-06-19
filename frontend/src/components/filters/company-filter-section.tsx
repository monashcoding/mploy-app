// frontend/src/components/filters/company-filter-section.tsx
"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Text,
  TextInput,
  ScrollArea,
  Checkbox,
  Pill,
  Skeleton,
  Button,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { getCompanyFacets } from "@/actions/company-facets";
import { CompanyFacet } from "@/types/filters";

// How many "hidden" chips to show before collapsing the rest into "+N more".
const MAX_VISIBLE_HIDDEN = 6;

// Duration (ms) of the hidden-chips expand/collapse animation (both directions).
const HIDDEN_ANIM_MS = 260;

/**
 * A single company row. Memoised so toggling one company (or unrelated re-renders
 * from route navigation) doesn't reconcile the entire list, keeping animations
 * smooth. `onToggle` must be referentially stable for the memo to be effective.
 */
const CompanyRow = memo(function CompanyRow({
  company,
  count,
  checked,
  onToggle,
}: {
  company: string;
  count: number;
  checked: boolean;
  onToggle: (company: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(company)}
      className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-selected text-left"
    >
      <Checkbox
        checked={checked}
        onChange={() => {}}
        label={company}
        color="accent"
        iconColor="dark.9"
        size="sm"
        className="pointer-events-none"
        tabIndex={-1}
      />
      <Text size="sm" c="dimmed" className="tabular-nums">
        {count}
      </Text>
    </button>
  );
});

/**
 * Exclusion-based company filter. All companies are shown by default; the user
 * unchecks (hides) companies they don't want to see. Counts reflect every other
 * active filter but NOT the company exclusion itself (standard faceted search).
 */
export function CompanyFilterSection() {
  const { filters, updateFilters } = useFilterContext();
  const excluded = filters.filters.excludedCompanies;

  const [facets, setFacets] = useState<CompanyFacet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Chips rendered in the "hidden" row. When clearing, this lags behind
  // `excluded` so the area animates closed with content still present. It's
  // driven from setExcluded (an event handler) to keep setState out of effects.
  const [displayedHidden, setDisplayedHidden] = useState<string[]>(excluded);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  // Animate the hidden-chips area to its measured content height, so EVERY change
  // (open, close, and wrapping to more/fewer rows) transitions smoothly.
  const hiddenContentRef = useRef<HTMLDivElement>(null);
  const [hiddenHeight, setHiddenHeight] = useState(0);
  const [animateHidden, setAnimateHidden] = useState(false);

  useLayoutEffect(() => {
    const el = hiddenContentRef.current;
    if (!el) return;
    const measure = () => setHiddenHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // Enable the transition only after the first measure to avoid a mount jump.
    const raf = requestAnimationFrame(() => setAnimateHidden(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Edge "scroll shadows" so the list reads as scrollable when it overflows.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateScrollFades = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setShowTopFade(el.scrollTop > 1);
    setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  // Only the non-company filters affect the counts. Memoised so the fetch effect
  // re-runs exactly when one of them changes (not when exclusions change).
  const facetFilters = useMemo(
    () => ({
      search: filters.filters.search,
      jobTypes: filters.filters.jobTypes,
      locations: filters.filters.locations,
      workingRights: filters.filters.workingRights,
      industryFields: filters.filters.industryFields,
    }),
    [
      filters.filters.search,
      filters.filters.jobTypes,
      filters.filters.locations,
      filters.filters.workingRights,
      filters.filters.industryFields,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    getCompanyFacets(facetFilters)
      .then((res) => {
        if (!cancelled) setFacets(res);
      })
      .catch(() => {
        if (!cancelled) setFacets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [facetFilters]);

  const excludedSet = useMemo(() => new Set(excluded), [excluded]);

  const visibleFacets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facets;
    return facets.filter((f) => f.company.toLowerCase().includes(q));
  }, [facets, search]);

  // Recompute fades whenever the rendered list changes (load, search, toggle).
  useEffect(() => {
    updateScrollFades();
  }, [visibleFacets, loading, updateScrollFades]);

  // Keep latest values in a ref so the handlers can have stable identities
  // (empty deps). Stable `onToggle` lets the memoised rows skip re-rendering.
  // The ref is updated in an effect (never during render) per react-hooks/refs.
  const latest = useRef({ excluded, filters, updateFilters });
  useEffect(() => {
    latest.current = { excluded, filters, updateFilters };
  });

  const setExcluded = useCallback((next: string[]) => {
    const { filters, updateFilters } = latest.current;
    // Drive the chips row: show `next` while non-empty; when clearing, keep the
    // current chips mounted until the collapse animation finishes.
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    if (next.length > 0) {
      setDisplayedHidden(next);
    } else {
      clearTimerRef.current = setTimeout(
        () => setDisplayedHidden([]),
        HIDDEN_ANIM_MS + 40,
      );
    }
    updateFilters({
      filters: {
        ...filters.filters,
        excludedCompanies: next,
        page: 1,
      },
    });
  }, []);

  const toggleCompany = useCallback(
    (company: string) => {
      const { excluded } = latest.current;
      setExcluded(
        excluded.includes(company)
          ? excluded.filter((c) => c !== company)
          : [...excluded, company],
      );
    },
    [setExcluded],
  );

  const clearCompanies = useCallback(() => setExcluded([]), [setExcluded]);

  return (
    <div className="mb-6">
      <div className="flex flex-row items-center justify-between mb-2 min-h-[1.625rem]">
        <Text size="sm" fw={600}>
          Companies
          {facets.length > 0 && (
            <Text span size="sm" c="dimmed" fw={400}>
              {" "}
              ({facets.length})
            </Text>
          )}
        </Text>
        {excluded.length > 0 && (
          <div className="flex flex-row items-center gap-2">
            <Text size="xs" c="dimmed">
              {excluded.length} hidden
            </Text>
            <Button
              variant="subtle"
              size="compact-xs"
              color="accent"
              onClick={clearCompanies}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div
        style={{
          height: excluded.length > 0 ? hiddenHeight : 0,
          overflow: "hidden",
          transition: animateHidden
            ? `height ${HIDDEN_ANIM_MS}ms ease-in-out`
            : undefined,
        }}
      >
        <div ref={hiddenContentRef} className="pb-3">
          <Pill.Group gap={6}>
            {displayedHidden.slice(0, MAX_VISIBLE_HIDDEN).map((company) => (
              <Pill
                key={company}
                withRemoveButton
                onRemove={() => toggleCompany(company)}
                bg="selected"
              >
                {company}
              </Pill>
            ))}
            {displayedHidden.length > MAX_VISIBLE_HIDDEN && (
              <Text size="xs" c="dimmed" className="self-center px-1">
                +{displayedHidden.length - MAX_VISIBLE_HIDDEN} more
              </Text>
            )}
          </Pill.Group>
        </div>
      </div>

      <TextInput
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        radius="md"
        size="sm"
        mb="xs"
      />

      {loading ? (
        <div className="flex flex-col gap-2 py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={24} radius="sm" />
          ))}
        </div>
      ) : visibleFacets.length === 0 ? (
        <Text size="sm" c="dimmed" className="py-2">
          No companies match the current filters.
        </Text>
      ) : (
        <div className="relative">
          <ScrollArea.Autosize
            mah={260}
            type="auto"
            offsetScrollbars
            viewportRef={viewportRef}
            onScrollPositionChange={updateScrollFades}
          >
            <div className="flex flex-col pr-2">
              {visibleFacets.map((facet) => (
                <CompanyRow
                  key={facet.company}
                  company={facet.company}
                  count={facet.count}
                  checked={!excludedSet.has(facet.company)}
                  onToggle={toggleCompany}
                />
              ))}
            </div>
          </ScrollArea.Autosize>

          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-6 transition-opacity duration-150 ${
              showTopFade ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(to bottom, var(--mantine-color-body), transparent)",
            }}
          />
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 transition-opacity duration-150 ${
              showBottomFade ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(to top, var(--mantine-color-body), transparent)",
            }}
          />
        </div>
      )}
    </div>
  );
}
