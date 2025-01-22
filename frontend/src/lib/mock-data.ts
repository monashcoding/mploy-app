// frontend/src/lib/mock-data.ts
import { Job } from "@/types/job";

export const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: {
      name: "TechCorp",
      website: "https://techcorp.com",
    },
    description: "Looking for a frontend developer...",
    type: "Full-time",
    locations: ["Sydney", "Remote"],
    studyFields: ["Computer Science", "Software Engineering"],
    workingRights: ["Australian Citizen", "Permanent Resident"],
    applicationUrl: "https://apply.techcorp.com/frontend-dev",
    closeDate: "2024-12-31",
    startDate: "2024-02-01",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  // Add more mock jobs as needed
];
