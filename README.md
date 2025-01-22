# MPloy Job Board

A modern job board application built with Next.js, Spring Boot, and Go, designed to help students find internships and job opportunities.

### Frontend
- Next.js 15 with App Router
- React 19
- TypeScript
- Mantine UI
- Tailwind CSS

### Backend
- Spring Boot (Kotlin)
- Redis for caching
- RESTful APIs

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
  - shared/alex/docker-setup
  ```
  
## License
This project is licensed under the MIT License.