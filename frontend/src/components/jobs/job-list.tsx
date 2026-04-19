// frontend/src/components/jobs/job-list.tsx
"use client";

import JobCard from "@/components/jobs/job-card";
import JobCardGrid from "@/components/jobs/job-card-grid";
import JobCardDense from "@/components/jobs/job-card-dense";
import { useFilterContext } from "@/context/filter/filter-context";
import { Job } from "@/types/job";
import { useEffect, useState } from "react";
import { Modal, ScrollArea } from "@mantine/core";
import JobDetails from "@/components/jobs/job-details";
import JobListLoading from "@/components/layout/job-list-loading";
import JobPagination from "@/components/jobs/job-pagination";
import { useMediaQuery } from "@mantine/hooks";

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  const { selectedJob, setSelectedJob, isLoading, viewMode } =
    useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob, setSelectedJob]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    // Open modal on mobile, or in grid mode on desktop
    if (!isDesktop || viewMode === "grid") {
      setIsModalOpen(true);
    }
  };

  const renderSplitView = () => (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => handleJobClick(job)}
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
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => handleJobClick(job)}
        >
          <JobCardGrid job={job} isSponsor={job.highlight} />
        </div>
      ))}
    </div>
  );

  const renderDenseView = () => (
    <div className="space-y-1.5">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => handleJobClick(job)}
          className="cursor-pointer"
        >
          <JobCardDense
            job={job}
            isSelected={selectedJob?.id === job.id}
          />
        </div>
      ))}
    </div>
  );

  const renderView = () => {
    switch (viewMode) {
      case "grid":
        return renderGridView();
      case "dense":
        return renderDenseView();
      default:
        return renderSplitView();
    }
  };

  return (
    <>
      <ScrollArea
        className="h-[calc(100svh-160px)] lg:h-[calc(100svh-200px)]"
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
        <div
          className={`pr-1 transition-opacity duration-200 ${
            isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          {renderView()}
        </div>
        <JobPagination />
      </ScrollArea>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
        scrollAreaComponent={ScrollArea}
        fullScreen={!isDesktop}
        radius={isDesktop ? "lg" : undefined}
        styles={{
          body: {
            height: isDesktop ? "80vh" : "calc(100svh - 100px)",
          },
          content: {
            background: "#2e2e2e",
          },
          header: {
            background: "#2e2e2e",
          },
        }}
      >
        <JobDetails />
      </Modal>
    </>
  );
}
