# MPLOY - MAC Job Board

Hey there! 👋

This is a modern, intelligent job board platform that automatically aggregates job listings, providing users with a streamlined experience to search, filter, and discover relevant opportunities. The platform updates daily with fresh listings through our smart AI robots.

## Features 🚀

- Jobs update automatically every single day from various sources (automatically deduplicated)
- We use AI to help fix, sort and summarise the listings
- You can filter for exactly what you want (e.g. Big Tech Intern Roles for International students)
- Works perfectly on phone or laptop
- Server-side rendering (where possible) with Next.js 15 App Router
- Multiple filters can be applied at once, including text search
- Desktop/mobile responsive UI: list/details on desktop, modal on mobile
- State persists in URL: search, filters, pagination (`/jobs?q=dev&location=sydney&page=2`)
- Direct job links supported (`/jobs/[id]`)
- Parallel data fetching for faster loads
- Real-time job search with debouncing

## Frontend

- Next.js 15: Utilizing the App Router for server-side rendering and optimized client-side navigation
- React 19: For building the interactive user interface components
- TypeScript: Ensuring type safety across the codebase
- Mantine UI: For consistent, accessible UI components
- Tailwind CSS: For utility-first styling and responsive design

### Key Patterns

- **State Management**: Start with props; use custom hooks for reusable logic; Context for global state (e.g., job filters).
- **Data Flow**: URL as source of truth for filters/search; debounced API calls; prefetching for pagination.
- **Components**: Keep thin (50-150 lines); use layouts for shared UI; mark client components with "use client".
- **Features Used**: Intercepting routes for modals; Suspense for loading; Error boundaries; useMemo/useRef for optimization.

### Structure

```
src/
├── app/
│   ├── jobs/          # Main jobs route with filters, listing, details
│   │   ├── [id]/      # Dynamic job page
│   │   └── error.tsx  # Job-specific error handling
│   ├── layout.tsx     # Root layout with providers
│   └── page.tsx       # Home (redirects to /jobs)
├── components/
│   ├── jobs/          # Job cards, lists, details, filters
│   └── layout/        # Nav, logo, search bar
├── context/
│   └── filter/        # Filter state provider
└── lib/               # Utils, theme
```

## Backend

- Server Actions: Answers search and feedback requests
- MongoDB: Stores job listings and related metadata
- GoLang: Powers our web robots (this part is not open source)

## Getting Started

### Prerequisites

- Node.js 20+
- Java 17
- Go 1.21+
- Docker & Docker Compose
- Redis

### Local Development

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

```
MONGODB_URI=
MONGODB_DATABASE=default
MONGODB_COLLECTION=listings

NODE_ENV=development
```

## Development Guidelines

### Git Workflow

#### Branch Structure

- `production` - Production branch
- `dev` - Development branch
- Feature branches follow the pattern:
  ```
  <component>/<developer>/<feature-name>
  Examples:
  - backend/edwn/redis-caching
  - frontend/sarah/job-filters
  ```

### Coding Conventions

- Use kebab-case for files (e.g., `product-card.ts`); camelCase for hooks (e.g., `useCustomHook`).
- Group related components in feature directories (e.g., `components/jobs/filters/`).
- Prioritize server components; use "use client" only when needed.
- Build with scalability and observability in mind (e.g., structured logging with Pino).

## Deployment (Development and Production)

- We are deployed on Azure Container Apps via Github Actions.
- GitHub Actions -> builds containers -> Azure Containers Registry -> Azure Container Apps.

## License

This project is licensed under the MIT License.
