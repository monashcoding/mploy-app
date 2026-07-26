// src/components/JobDetailsWrapper.tsx
"use client";

import { useEffect } from "react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDetails from "@/components/jobs/job-details";
import { Job } from "@/types/job";
import { useSearchParams } from "next/navigation";
import { trackJobView } from "@/actions/analytics";

interface JobDetailsWrapperProps {
  job: Job;
}

export default function JobDetailsWrapper({ job }: JobDetailsWrapperProps) {
  const { setSelectedJob } = useFilterContext();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    // Set the fetched job into context
    setSelectedJob(job);
    trackJobView({ jobId: job.id, ref });
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return <JobDetails />;
}
