# MAC Job Board

Hey there! 👋

This is a modern, intelligent job board platform that automatically aggregates job listings, providing users with a streamlined experience to search, filter, and discover relevant opportunities. The platform updates daily with fresh listings through our smart AI robots.

## Features 🚀
- Jobs update automatically every single day from various sources (automatically deduplicated)
- We use AI to help fix, sort and summarise the listings
- You can filter for exactly what you want (e.g. Big Tech Intern Roles for Interational students)
- Works perfectly on phone or laptop

## Frontend

- Next.js 15: Utilizing the App Router for server-side rendering and optimized client-side navigation
- React 19: For building the interactive user interface components
- TypeScript: Ensuring type safety across the codebase
- Mantine UI: For consistent, accessible UI components
- Tailwind CSS: For utility-first styling and responsive design

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
# Start all services
docker compose -f docker-compose.dev.yml up
# Alternative if Make is installed
make dev

# Frontend only
cd frontend
npm install
npm run dev

# Backend only
cd backend
./gradlew bootRun
```

## Development Guidelines

### Git Workflow

#### Branch Structure
- `main` - Production branch
- `dev` - Development branch
- Feature branches follow the pattern:
  ```
  <component>/<developer>/<feature-name>
  Examples:
  - backend/edwn/redis-caching
  - frontend/sarah/job-filters
  ```
  
## License
This project is licensed under the MIT License.