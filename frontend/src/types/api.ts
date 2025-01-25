// frontend/src/types/api.ts
import { Job } from "@/types/job";

export interface JobsResponse {
  jobs: Job[];
  total: number;
}

export interface ApiError {
  message: string;
  code: string;
}
