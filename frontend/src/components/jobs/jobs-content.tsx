// frontend/src/components/jobs/jobs-content.tsx
"use client";

import { useFilterContext } from "@/context/filter/filter-context";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { Job } from "@/types/job";
import { Suspense } from "react";
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";

interface JobsContentProps {
  jobs: Job[];
}

export default function JobsContent({ jobs }: JobsContentProps) {
  const { viewMode } = useFilterContext();

  if (viewMode === "grid") {
    return (
      <Suspense fallback={<JobListLoading />}>
        <JobList jobs={jobs} />
      </Suspense>
    );
  }

  if (viewMode === "dense") {
    return (
      <div className="flex flex-col lg:flex-row">
        <div id="job-list-container" className="lg:pr-3 w-full lg:w-[40%]">
          <Suspense fallback={<JobListLoading />}>
            <JobList jobs={jobs} />
          </Suspense>
        </div>
        <div className="hidden lg:block lg:w-[60%] overflow-y-auto h-[calc(100svh-200px)]">
          <Suspense fallback={<JobDetailsLoading />}>
            <JobDetails />
          </Suspense>
        </div>
      </div>
    );
  }

  // Split view (default)
  return (
    <div className="flex flex-col lg:flex-row">
      <div id="job-list-container" className="lg:pr-3 w-full lg:w-[38%]">
        <Suspense fallback={<JobListLoading />}>
          <JobList jobs={jobs} />
        </Suspense>
      </div>
      <div className="hidden lg:block lg:w-[62%] overflow-y-auto h-[calc(100svh-200px)]">
        <Suspense fallback={<JobDetailsLoading />}>
          <JobDetails />
        </Suspense>
      </div>
    </div>
  );
}
