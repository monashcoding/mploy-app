// src/components/JobDetailsWrapper.tsx
"use client";

import { useEffect } from "react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDetails from "@/components/jobs/job-details";
import { Job } from "@/types/job";

interface JobDetailsWrapperProps {
  job: Job;
}

export default function JobDetailsWrapper({ job }: JobDetailsWrapperProps) {
  const { setSelectedJob } = useFilterContext();

  useEffect(() => {
    // Set the fetched job into context
    setSelectedJob(job);
  }, [job, setSelectedJob]);

  return <JobDetails />;
}
