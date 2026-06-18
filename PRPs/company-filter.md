# PRP: Company Filter (exclusion-based, with live counts)

> Status: Draft / source of truth for `frontend/michael/company-filter`
> Owner: michael
> Last updated: 2026-06-18

## 1. Goal

Add a **Companies** section to the job filters (under "Experience") that:

1. Lists every company that has listings under the _currently applied_ filters.
2. Shows a **live count** next to each company name (e.g. `Jane Street  34`).
3. Lets the user **hide/exclude** companies from the results. All companies are
   shown by default; the user opts _out_ of companies they don't want to see.
4. Always offers a one-click way to bring an excluded company back.

## 2. Why

- Users often want "everything except a few companies" (e.g. hide a consultancy
  spamming listings) or "only these big employers." Inclusion-only chips don't
  serve the "everything except X" case well.
- Per-company counts give users a sense of where the volume is and make the
  board feel data-rich and trustworthy.

## 3. What (user-visible behaviour)

### Semantics: exclusion, not inclusion

- The other four sections (Industry, Location, Working Rights, Experience) are
  **inclusive**: selecting values narrows results to those values.
- Companies is **exclusion-based**: the empty state means "show all companies."
  State stores only the _excluded_ companies (`excludedCompanies: string[]`).
- This keeps the default (`[]`) meaning "no filter active," consistent with
  `ResetFilters` and the URL-as-source-of-truth pattern.

### Faceted counts (important rule)

- Each company's count reflects **all other active filters** (Industry,
  Location, Working Rights, Experience, search) **but NOT** the company
  exclusion itself.
- Rationale (standard faceted search): excluding "Canva" must not change the
  count shown next to "Jane Street." A facet ignores its own selection.
- The **results total** ("289 Results") and the job list **do** respect the
  company exclusion (excluded companies disappear from results).

### UI (as shipped)

A searchable checklist (chips do not scale to 100+ companies):

```
Companies (268)                              3 hidden  [Clear]
  [Canva ✕] [Acme ✕] [Globex ✕]                  ← animated chips
┌──────────────────────────────────────────────────────┐
│ 🔍 Search companies...                                 │
├──────────────────────────────────────────────────────┤
│  ☑  Jane Street ................................... 34 │
│  ☑  Atlassian ..................................... 28 │
│  ☑  IMC ........................................... 19 │
│  ☐  Canva ......................................... 12 │  ← unchecked = hidden
│  ☑  Google ........................................ 11 │
│            … scrolls (with edge fades), count desc …   │
└──────────────────────────────────────────────────────┘
```

- **All checked by default** → "showing all." Unchecking a row hides that
  company; the whole row is clickable.
- **Count right-aligned**, sorted **count desc** (then name asc as tiebreak).
- **Search box** filters visible rows client-side.
- **Header summary + Clear**: when anything is hidden, the header shows
  `N hidden` plus a single accent **Clear** button that empties the exclusion
  (only the company filter; other filters untouched). There is intentionally no
  "Hide all" (hiding everything yields 0 results — a footgun, and not requested).
- **Hidden chips row** appears only when `excludedCompanies.length > 0`. Shows up
  to `MAX_VISIBLE_HIDDEN` (6) chips then `+N more`; each `Company ✕` chip
  un-hides that company. Delivers the requested "✕ to filter out" feel as a
  compact summary rather than an ✕ on every one of 100+ rows.

#### Interaction / polish details

- **Scroll affordance**: the list shows the scrollbar on overflow (`type="auto"`)
  plus top/bottom gradient "scroll shadows" (driven by viewport scroll position)
  so it reads as scrollable.
- **Smooth resizing**: the hidden-chips area animates its height for _every_
  change — open, close, and wrapping to more/fewer rows — by transitioning to its
  measured content height (via `ResizeObserver`), not Mantine `Collapse` (which
  only animates the open/close toggle). A small lagging `displayedHidden` keeps
  chips mounted through the close so it slides instead of snapping. One constant
  (`HIDDEN_ANIM_MS`) drives both directions.
- **Performance**: each row is a memoised `CompanyRow` with a referentially
  stable `onToggle`, so toggling one company (or unrelated re-renders from the
  route navigation) doesn't reconcile all ~268 rows — keeping the animation
  smooth.

### Placement

- **Modal only**, under the Experience section in `filter-modal.tsx`.
- Not added to the mobile `dropdown-filter` bar in v1 (list is too long for a
  combobox; revisit later).

## 4. Current architecture (context for implementer)

- **Filter state** lives in React context:
  - `frontend/src/types/filters.ts` → `JobFilters`, `FilterState`.
  - `frontend/src/context/filter/filter-provider.tsx` → parses URL → state,
    `updateFilters`, `clearFilters`, `emptyFilterState`, `initialFilterState`.
  - `frontend/src/context/filter/filter-context.tsx` → context type.
- **URL is the source of truth.** `CreateQueryString` in `frontend/src/lib/utils.ts`
  serialises arrays as `key[]=v1&key[]=v2`. Array fields are re-parsed in
  `filter-provider.tsx` via `searchParams.getAll("key[]")`.
- **Modal UI**: `frontend/src/components/filters/filter-modal.tsx` renders four
  `FilterSectionGroup`s (`filter-section-group.tsx` → `toggle-tag.tsx`).
- **Results header**: `frontend/src/components/filters/filter-section.tsx` shows
  "{total} Results"; `reset-filters.tsx` shows Reset when any filter is active.
- **Data layer**: `frontend/src/actions/jobs.fetch.ts`
  - `getJobs(filters)` builds a Mongo query via `buildJobQuery`, paginates
    (`PAGE_SIZE = 20`), returns `{ jobs, total }`, LRU-cached (1h).
  - Collection: `client.db("default").collection("active_jobs")`.
  - Base query always includes `outdated: false`. Company name field is
    `company.name`.
  - Sponsored-job logic builds on top of the same `query`, so any company
    exclusion added to `buildJobQuery` automatically applies to sponsored picks.

## 5. Design / implementation

### 5.1 Data model + URL

`frontend/src/types/filters.ts`:

```ts
export interface JobFilters {
  search: string;
  jobTypes: JobType[];
  locations: LocationType[];
  workingRights: WorkingRight[];
  industryFields: IndustryField[];
  excludedCompanies: string[]; // NEW — company names to hide
  page: number;
}
```

`filter-provider.tsx`:

- Add `excludedCompanies: []` to `emptyFilterState`.
- Parse `searchParams.getAll("excludedCompanies[]")` in `initialFilterState`
  (no enum validation — company names are dynamic; trim + dedupe).
- `CreateQueryString` already serialises arrays, so URL sync is automatic.

`reset-filters.tsx`:

- Include `excludedCompanies.length > 0` in `hasActiveFilters()`.

### 5.2 Backend — facet counts

New server action in `frontend/src/actions/jobs.fetch.ts`:

```ts
export interface CompanyFacet {
  company: string;
  count: number;
}

export async function getCompanyFacets(
  filters: Partial<JobFilters>,
): Promise<CompanyFacet[]>;
```

- Reuse `buildJobQuery(filters)` but **omit the company `$nin` clause** (a facet
  ignores its own selection). Implementation: strip `excludedCompanies` /
  `excludedCompanies[]` before building, OR add a `buildJobQuery` option like
  `{ includeCompanyExclusion: false }`.
- Aggregation:

```js
[
  { $match: <query without company exclusion> },
  { $group: { _id: "$company.name", count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
]
```

- Map `_id → company`. LRU-cache with a key derived from the normalised
  non-company filters (reuse `normalizeFiltersForKey`, exclude company key).

Extend `buildJobQuery` to add the exclusion for the job list / total:

```js
...(excludedCompanies?.length && {
  "company.name": { $nin: excludedCompanies },
}),
```

This flows into both the paginated `find` and `countDocuments(query)`, so the
results total respects the exclusion.

### 5.3 Frontend — Company section component

New `frontend/src/components/filters/company-filter-section.tsx` (client):

- On mount / when modal opens, call `getCompanyFacets(filters.filters)`.
- Refetch when the _non-company_ filters change (industry/location/rights/
  experience/search). Do **not** refetch on `excludedCompanies` change (facets
  ignore it) to avoid loops.
- State: `facets: CompanyFacet[]`, `loading`, `query` (search box).
- A company is "checked" when it is **not** in `excludedCompanies`.
- Toggling a row updates `excludedCompanies` via `updateFilters({ ..., page: 1 })`.
- Render:
  - Header row: "Companies" + Clear/Reset buttons.
  - Search `TextInput` (debounced ~200ms, client filter on company name).
  - Scrollable list of rows: `Checkbox` + name (left) + count (right).
  - "Hidden" chips row when `excludedCompanies.length > 0` — each chip removes
    one company from the exclusion list.
- Loading + empty states (skeleton / "No companies match").

Wire into `filter-modal.tsx` after the Experience `FilterSectionGroup`.

### 5.4 Files touched (summary)

| File                                            | Change                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| `types/filters.ts`                              | add `excludedCompanies` to `JobFilters`        |
| `context/filter/filter-provider.tsx`            | parse + default `excludedCompanies`            |
| `components/filters/reset-filters.tsx`          | include exclusions in active check             |
| `actions/jobs.fetch.ts`                         | `getCompanyFacets` + `$nin` in `buildJobQuery` |
| `components/filters/company-filter-section.tsx` | NEW component                                  |
| `components/filters/filter-modal.tsx`           | render new section                             |

## 6. Edge cases

- **Stale exclusions**: a company excluded earlier may no longer appear under the
  current other-filters. Still render it in the "Hidden" chips so it stays
  restorable even if it's not in the current facet list.
- **Empty facets**: filters yield zero companies → show empty state; the page
  already shows `NoResults` when `total <= 0`.
- **Large lists**: virtualise only if needed; start with `ScrollArea` (already
  capped at `h={500}` in the modal). Search mitigates length.
- **Name as identity**: companies are keyed by `company.name` (no stable id in
  the schema). Acceptable; matches how the job query already works.
- **Caching**: facet cache must key off non-company filters only so toggling
  exclusions doesn't thrash the cache.
- **Sponsored jobs**: excluded companies must not appear even as sponsored —
  satisfied automatically because sponsored query extends the base `query`.

## 7. Validation / test plan

Manual (local, see Section 9):

1. Open Filters → Companies section lists companies with counts summing to total.
2. Apply Industry = Quant Trading → company list + counts refresh to quant-only.
3. Uncheck a company → it disappears from results, total drops, other counts
   unchanged; a "Hidden" chip appears.
4. Click the Hidden chip ✕ → company returns to results.
5. Reload page → exclusions persist via URL (`excludedCompanies[]=...`).
6. Reset Filters → exclusions cleared, all companies shown.
7. Search box filters the company rows.

Automated/typecheck:

- `npm run lint` clean, `npx tsc --noEmit` clean, `npm run build` succeeds.

## 8. Out of scope (v1)

- Company logos in the checklist rows.
- Inclusion mode ("only these companies") — exclusion covers the requested UX.
- Company filter in the mobile dropdown bar.
- List virtualisation (revisit if perf requires).

## 9. Running locally (to play & test)

```bash
cd frontend
npm install
# create env (see frontend/.env.example), then:
npm run dev   # http://localhost:3000  -> /jobs
```

Requires `MONGODB_URI` pointing at a database with an `active_jobs` collection.
See `frontend/.env.example`. Without it, `getJobs` throws and no jobs render.

## 10. Resolved decisions

- **Bulk actions**: shipped a single accent **Clear** (shown only when something
  is hidden). Dropped "Hide all"/"Show all" — hiding everything yields 0 results
  and confused the clear path.
- **Fetch timing**: lazy — facets are fetched when the component mounts (i.e.
  when the modal first opens) and refetched only when a non-company filter
  changes. Results are LRU-cached server-side, so re-opening is instant.
