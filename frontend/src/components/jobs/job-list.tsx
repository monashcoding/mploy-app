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
import { useMediaQuery } from "@mantine/hooks";

interface JobListProps {
  jobs: Job[]; // Regular jobs
}

export default function JobList({ jobs}: JobListProps) {
//export default function JobList({ jobs, sponsoredJobs }: JobListProps) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!selectedJob) {
        setSelectedJob(jobs[0]);
      }
  }, [jobs, selectedJob, setSelectedJob]);

  if (isLoading) return <JobListLoading />;

  return (
    <>
      {/* This is a workaround to ensure mobile job cards are unaffected by the scrollbar. */}
      <ScrollArea
        className={"h-[calc(100svh-140px)] lg:h-[calc(100svh-180px)]"}
        type="auto"
        scrollbarSize={isDesktop ? undefined : 2}
        offsetScrollbars={isDesktop}
        classNames={
          isDesktop
            ? {
                scrollbar: "absolute right-[-2px] lg:right-0",
              }
            : undefined
        }
      >
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
              <JobCard
                job={job}
                isSelected={selectedJob?.id === job.id}
                isSponsor={job.highlight}
              />
            </div>
          ))}
        </div>
        <JobPagination />
      </ScrollArea>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
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
