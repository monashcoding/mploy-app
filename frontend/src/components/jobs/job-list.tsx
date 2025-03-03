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
import SponsorSection from "./sponsor-section";

interface JobListProps {
  jobs: Job[]; // Regular jobs
  sponsoredJobs: Job[]; // Sponsored jobs
}

export default function JobList({ jobs, sponsoredJobs }: JobListProps) {
  const { selectedJob, setSelectedJob, isLoading } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!selectedJob) {
      if (sponsoredJobs.length > 0) {
        setSelectedJob(sponsoredJobs[0]);
      } else if (jobs.length > 0) {
        setSelectedJob(jobs[0]);
      }
    }
  }, [jobs, sponsoredJobs, selectedJob, setSelectedJob]);

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
        <SponsorSection sponsoredJobs={sponsoredJobs}></SponsorSection>
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
                isSponsor={false}
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
