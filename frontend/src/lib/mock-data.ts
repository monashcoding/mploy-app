// frontend/src/lib/mock-data.ts
import { Job } from "@/types/job";
import jobsData from "./jobs.json";
import { transformJobData } from "./transform-job-data";

export const MOCK_JOBS: Job[] = (jobsData as never[]).map(transformJobData);
