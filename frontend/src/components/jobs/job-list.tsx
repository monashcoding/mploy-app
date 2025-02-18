// frontend/src/components/jobs/details/job-list.tsx
"use client";

import JobCard from "@/components/jobs/job-card";
import { useFilterContext } from "@/context/filter/filter-context";
import { Job } from "@/types/job";
import { useEffect, useState } from "react";
import { Modal, ScrollArea } from "@mantine/core";
import JobDetails from "@/components/jobs/job-details";
import JobListLoading from "@/components/layout/job-list-loading";

export default function JobList({ jobs }: { jobs: Job[] }) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob, setSelectedJob]);

  if (isLoading) return <JobListLoading />;

  return (
    <>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => {
              setSelectedJob(job);
              // Only open modal on mobile
              if (window.innerWidth < 1024) {
                setIsModalOpen(true);
              }
            }}
            className="cursor-pointer"
          >
            <JobCard job={job} isSelected={selectedJob?.id === job.id} />
          </div>
        ))}
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        scrollAreaComponent={ScrollArea}
        className="lg:hidden"
        fullScreen
        styles={{
          body: {
            height: "calc(100vh - 120px)",
          },
        }}
      >
        <JobDetails />
      </Modal>
    </>
  );
}
