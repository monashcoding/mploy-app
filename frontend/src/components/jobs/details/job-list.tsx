// frontend/src/components/jobs/details/job-list.tsx
"use client";

import JobCard from "@/components/jobs/details/job-card";
import { useFilterContext } from "@/context/filter/filter-context";
import { Job } from "@/types/job";
import { useEffect } from "react";
import Loading from "@/app/loading";

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => setSelectedJob(job)}
          className="cursor-pointer"
        >
          <JobCard job={job} isSelected={selectedJob?.id === job.id} />
        </div>
      ))}
    </div>
  );
}
