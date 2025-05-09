// frontend/src/components/jobs/job-list.tsx
"use client";

import JobCard from "@/components/jobs/job-card";
import { useFilterContext } from "@/context/filter/filter-context";
import { Job } from "@/types/job";
import { useEffect, useMemo, useState } from "react";
import { Modal, ScrollArea } from "@mantine/core";
import JobDetails from "@/components/jobs/job-details";
import JobListLoading from "@/components/layout/job-list-loading";
import JobPagination from "@/components/jobs/job-pagination";
import { useMediaQuery } from "@mantine/hooks";

interface JobListProps {
  jobs: Job[]; // Regular jobs
}

export default function JobList({ jobs }: JobListProps) {
  //export default function JobList({ jobs, sponsoredJobs }: JobListProps) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const sortedJobs = useMemo(() => {
    const copy = [...jobs];
    copy.sort((a, b) => {
      // Primary key → highlighted first
      const highDiff = (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0);
      return highDiff;
    });
    return copy;
  }, [jobs]);

  useEffect(() => {
    const selectionMissing =
      !selectedJob || !sortedJobs.some((job) => job.id === selectedJob.id);

    if (selectionMissing && sortedJobs.length > 0) {
      setSelectedJob(sortedJobs[0]);
    }
  }, [selectedJob, sortedJobs, setSelectedJob]);

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
          {sortedJobs.map((job) => (
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
                isSponsor={!!job.highlight}
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
