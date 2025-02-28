// frontend/src/components/jobs/job-list.tsx
"use client";

import JobCard from "@/components/jobs/job-card";
import { useFilterContext } from "@/context/filter/filter-context";
import { Job } from "@/types/job";
import { useEffect, useState } from "react";
import { Modal, ScrollArea } from "@mantine/core";
import JobDetails from "@/components/jobs/job-details";
import JobListLoading from "@/components/layout/job-list-loading";
import JobPagination from "@/components/jobs/job-pagination";

export default function JobList({ jobs }: { jobs: Job[] }) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Effect to set initial selection when jobs change and no job is selected
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob, setSelectedJob]);

  if (isLoading) return <JobListLoading />;

  return (
    <>
      <ScrollArea h="calc(100svh - 200px)" type="auto" offsetScrollbars>
        <div className="space-y-4 pr-1">
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
        <JobPagination />
      </ScrollArea>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        withCloseButton={false}
        scrollAreaComponent={ScrollArea}
        className="lg:hidden"
        fullScreen
        styles={{
          body: {
            height: "calc(100svh - 100px)",
          },
        }}
      >
        <JobDetails />
      </Modal>
    </>
  );
}
