# MPloy Job Board

Hey there! 👋

This is a modern, intelligent job board platform that automatically aggregates job listings, providing users with a streamlined experience to search, filter, and discover relevant opportunities. The platform updates daily with fresh listings through our smart AI robots.

## Features 🚀

- Jobs update automatically every single day from various sources (automatically deduplicated)
- We use AI to help fix, sort and summarise the listings
- You can filter for exactly what you want (e.g. Big Tech Intern Roles for International students)
- Works perfectly on phone or laptop
- Server-side rendering (where possible) with Next.js 15 App Router
- Multiple filters can be applied at once, including a text search filter
- Desktop/mobile responsive UI: list/details on desktop, modal on mobile
- State persists in URL: search, filters, pagination (`/jobs?q=dev&location=sydney&page=2`)
- Direct job links supported (`/jobs/[id]`)
- Parallel data fetching for faster loads
- Real-time job search with debouncing
- Data refreshed daily via Go scraper (not open source)
- Around 1k jobs, each ~4kB

## Tech Stack

### Frontend

- Next.js 15: Utilizing the App Router for server-side rendering and optimized client-side navigation
- React 19: For building the interactive user interface components
- TypeScript: Ensuring type safety across the codebase
- Tailwind CSS: For utility-first styling and responsive design

### Backend (Data Layer)

- Server Actions: Handle search and feedback requests
- MongoDB: Stores job listings and related metadata

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MongoDB (local or cloud, set MONGODB_URI)

### Local Development

```bash
# Start with Docker (includes dev server)
docker compose -f docker-compose.dev.yml up
# Alternative if Make is installed
make dev

# Or run frontend directly
npm install
npm run dev
```

## Development Guidelines

### Naming & File Structuring Conventions

- Everything uses kebab-case `product-card.ts` unless there's an agreed standard e.g. `useCustomHook` for hooks
- Group related components in feature directories (e.g. `components/layout/search/filter/` contains all components used for search filtering)
- Most UI components are 50-150 lines of code. Keep pages thin, move complex logic to components
- Use layouts for shared UI across routes

### State Management & Data Passing Patterns

- Begin with simple props passing - max 2 levels of components
- When stateful logic needs to be reused, move it to custom hooks
- When props drilling becomes cumbersome or state needs to be widely available, use Context (e.g. the global filter state of jobs should be context)
- Pre-fetch the data in the next job page
- Load the essential data first and display the page, while other job listings and details are being loaded
- Implement parallel data fetching when possible

### Next / React Features

- Intercepting Routes: Use intercepting routes for modal-like experiences
- Lazy Loading: use when we can defer the loading of heavy components
- Error Boundaries: define error.tsx files to catch errors to prevent the entire site from breaking
- Add `<Suspense/>` boundaries for loading state
- Use useMemo for expensive calculations (e.g. filtered results)
- Use useRef to maintain filter input values

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
│   │   │   ├── layout
│   │   │   │   └── logo.tsx     # Site logo component
│   │   │   │   └── nav-bar.tsx  # Navigation bar
│   ├── context
│   │   ├── jobs
│   │   │   └── filter-context.tsx   # Job state and actions context
│   │   │   └── jobs-provider.tsx  # Provider wrapper with initial state
│   ├── hooks
│   │   ├── use-job-filters.ts     # Filter logic and state management
│   │   ├── use-job-search.ts      # Search functionality and API calls
│   │   ├── use-pagination.ts      # Pagination state and navigation
│   │   ├── use-url-state.ts       # URL parameters sync with app state
│   ├── lib
│   │   ├── theme.ts         # Theme configuration
│   ├── types
│   │   └── api.ts          # API response/request types
│   │   └── filters.ts      # Filter option types
│   │   └── job.ts          # Job data types
├── tailwind.config.ts      # Tailwind CSS configuration
```

## Git Workflow

#### Branch Structure

- `main` - Production branch
- `dev` - Development branch
- Feature branches follow the pattern:
  ```
  <component>/<developer>/<feature-name>
  Examples:
  - ui/edwn/dark-mode
  - jobs/sarah/advanced-filters
  ```

## License

This project is licensed under the MIT License.
