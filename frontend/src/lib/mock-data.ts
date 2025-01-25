// frontend/src/lib/mock-data.ts
import { Job } from "@/types/job";
import jobsData from "./jobs.json";
import { transformJobData } from "./transform-job-data";

// Honestly i don't know what this does and why is it here
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const MOCK_JOBS: Job[] = (jobsData as never[]).map(transformJobData);
