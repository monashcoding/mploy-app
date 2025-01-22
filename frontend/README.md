# MPloy Job Board

MPloy is a very simple job board with search, filter and just a website that displays all the jobs. There are 3 components in this:

- Next.js is used for our frontend
- Kotlin (Springboot) REST backend
- GoLang scraper service that runs once a day to update our collection of jobs.

## Core Features

- Server-side rendering (where possible) with Next.js 15 App Router
- We want to build this app with modern principles like scalability, observability in mind.
- The job website will display 10 jobs at a time. users may filter these jobs based on whatever property.
- Multiple filters can be applied at once, including a text search filter.
- Desktop/mobile responsive UI: list/details on desktop, modal on mobile
- State persists in URL: search, filters, pagination (`/jobs?q=dev&location=sydney&page=2`)
- Direct job links supported (`/jobs/[id]`)
- Parallel data fetching for faster loads
- Real-time job search with debouncing
- Data refreshed daily via Go scraper
- There is around 1k jobs, each one with a size of around 4kBs.

### Naming & File Structuring Conventions

- Everything uses kebab-case `product-card.ts` unless theres an agreed standard e.g. `useCustomHook` for hook
- Group related components in feature directories (e.g. `components/layout/search/filter/` contains all components used for search filtering
- Most UI components are 50-150 lines of code. Keep pages thin, move complex logic to components
- Use layouts for shared UI across routes

## State Management & Data Passing Patterns

- Begin with simple props passing - max 2 levels of components
- When stateful logic needs to be reused, move it to custom hooks.
- When props drilling becomes cumbersome or state needs to be widely available, use Context. (e.g. the global fliter state of jobs should be context)
- Pre-fetch the data in the next job page
- Load the essential data first and display the page, while other job listings and details are being loaded.
- Implement parallel data fetching when possible

## Next / React Features

- Intercepting Routes: Use intercepting routes for modal-like experiences.
- Lazy Loading: use when we can defer the loading of heavy components
- Error Boundaries: define error.tsx files to catch errors to prevent the entire site from breaking
- Add <Suspense/> boundaries for loading state
- Use useMemo for expensive calculations (e.g. filtered results)
- Use useRef to maintain filter input values

## Mantine Usage Guidelines

### Core Principles

- Use Mantine components only when they provide significant value beyond basic HTML/CSS
- Prefer simple HTML/CSS for basic layout and text elements
- Consider bundle size and complexity impact

## Frontend Structure

```
├── next.config.ts           # Next.js configuration, API routes, environment
├── src
│   ├── app
│   │   ├── error.tsx       # Global error boundary UI
│   │   ├── jobs
│   │   │   ├── [id]        # Dynamic route for individual job pages
│   │   │   │   ├── @modal  # Intercepted route - shows job details as modal on mobile
│   │   │   │   ├── page.tsx # Individual job page UI
│   │   │   ├── error.tsx   # Job section error boundary
│   │   │   ├── layout.tsx  # Job section layout wrapper (includes JobsProvider)
│   │   │   ├── loading.tsx # Job section loading state
│   │   │   ├── page.tsx    # Main jobs listing page
│   │   ├── layout.tsx      # Root layout with nav and theme providers
│   │   ├── page.tsx        # Home page (redirects to /jobs)
│   ├── components
│   │   ├── jobs
│   │   │   ├── details
│   │   │   │   ├── job-card.tsx    # Individual job preview card
│   │   │   │   ├── job-details.tsx # Full job details view
│   │   │   │   ├── job-list.tsx    # Container for job cards with virtualization
│   │   │   ├── filters
│   │   │   │   ├── dropdown-filter.tsx  # Reusable filter dropdown
│   │   │   │   ├── dropdown-sort.tsx    # Sort options dropdown
│   │   │   │   ├── filter-section.tsx   # Container for all filters
│   │   │   ├── search
│   │   │   │   └── search-bar.tsx       # Search input with suggestions
│   │   ├── layout
│   │   │   └── logo.tsx     # Site logo component
│   │   │   └── nav-bar.tsx  # Navigation bar
│   ├── context
│   │   ├── jobs
│   │   │   └── jobs-context.tsx   # Job state and actions context
│   │   │   └── jobs-provider.tsx  # Provider wrapper with initial state
│   ├── hooks
│   │   ├── use-job-filters.ts     # Filter logic and state management
│   │   ├── use-job-search.ts      # Search functionality and API calls
│   │   ├── use-pagination.ts      # Pagination state and navigation
│   │   ├── use-url-state.ts       # URL parameters sync with app state
│   ├── lib
│   │   ├── theme.ts         # Mantine theme configuration
│   ├── types
│   │   └── api.ts          # API response/request types
│   │   └── filters.ts      # Filter option types
│   │   └── job.ts          # Job data types
├── tailwind.config.ts      # Tailwind CSS configuration
```

## Custom Hooks and Context

### `useUrlState`

```ts
// URL structure: /jobs?q=developer&location=sydney&page=1
const { updateUrlState, getStateFromUrl } = useUrlState();

// All filter changes update URL automatically
updateUrlState({ search: "developer", location: "sydney" });

// URL state is initial source of truth on page load
const initialState = getStateFromUrl();
```

### `useJobsContext`

```ts
// Jobs context provides centralized state management
const { state, updateFilters, setSelectedJob, clearFilters } = useJobsContext();

// Access jobs data and loading state
const { jobs, isLoading, selectedJobId, totalJobs } = state;

// Update filters (automatically syncs with URL)
updateFilters({ search: "developer" });
```

### `useJobSearch()` and `useJobFilters()`

```ts
// Debounced search with automatic API calls
const { searchJobs, debouncedSearch } = useJobSearch();

// Filter management with URL sync
const { handleFilterChange, handleClearFilters } = useJobFilters();

// Update multiple filters
handleFilterChange({
  locations: ["sydney"],
  jobTypes: ["full-time"],
});
```

### Pagination and Cache

```ts
// Managed by usePagination hook
const { currentPage, nextPage, prevPage } = usePagination({
  totalItems: totalJobs,
  itemsPerPage: 10,
});

// useJobSearch handles prefetching next page
useEffect(() => {
  if (hasNextPage) prefetchNextPage();
}, [currentPage]);
```

### Data Flow Example

When user searches:

1. SearchBar component calls useJobSearch().updateSearch()
2. useJobSearch updates JobsContext filters
3. useUrlState syncs new state to URL
4. useJobSearch triggers API call with new filters
5. Results update in JobsContext
6. JobList component re-renders with new data

When user opens job details:

1. JobCard calls selectJob from context
2. URL updates to include selectedJobId
3. JobDetails component renders selected job
4. On mobile, modal route is intercepted

```ts
// 1. User searches for jobs
function SearchBar() {
  const { handleFilterChange } = useJobFilters();

  return (
    <input
      onChange={(e) => handleFilterChange({ search: e.target.value })}
    />
  );
}

// 2. URL updates and jobs are fetched
function JobList() {
  const { state: { jobs, isLoading } } = useJobsContext();

  if (isLoading) return <Loading />;

  return jobs.map(job => <JobCard job={job} />);
}

// 3. User selects a job
function JobCard({ job }) {
  const { setSelectedJob } = useJobsContext();

  return (
    <div onClick={() => setSelectedJob(job.id)}>
      {job.title}
    </div>
  );
}

// 4. Job details display with URL sync
function JobDetails() {
  const { state: { selectedJobId, jobs } } = useJobsContext();
  const job = jobs.find(j => j.id === selectedJobId);

  return job ? <JobContent job={job} /> : null;
}
```

### Suggested AI Prompt

```
MPloy is a very simple job board with search, filter and just a website that displays all the jobs. More details about the project including coding guidelines and suggestions are in the README.md file. This should be strictly followed.

Attached is our project code. All code prefixed with frontend contains the code for the next.js codebase. The README contains coding guidelines and they should be followed at all times.

Help answer questions regarding this codebase. Unless otherwise specified, show only the changes the user needs to apply and include the directory of where the changes need to be applied as a comment.

Consider whether components should be client or server sided, and ensure client sided components are marked with "use client"

Always explain your thought process and await a go ahead before starting to solve a problem. If any prompt is unclear to you ask the user to clarify.
```
