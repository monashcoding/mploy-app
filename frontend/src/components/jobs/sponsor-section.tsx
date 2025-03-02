// src/components/jobs/sponsor-section.tsx
"use client";

import { Job } from "@/types/job";
import JobCard from "@/components/jobs/job-card";
import { useFilterContext } from "@/context/filter/filter-context";
import { useState } from "react";
import { Modal, ScrollArea } from "@mantine/core";
import JobDetails from "./job-details";

interface SponsorSectionProps {
  sponsoredJobs: Job[];
}

export default function SponsorSection({ sponsoredJobs }: SponsorSectionProps) {
  const { setSelectedJob } = useFilterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (sponsoredJobs.length === 0) return null;

  return (
    <><section className="pb-4">
      <div className="space-y-4 pr-1">
        {sponsoredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => {
              setSelectedJob(job);
              // Only open modal on mobile
              if (window.innerWidth < 1024) {
                setIsModalOpen(true);
              }
            } }
            className="cursor-pointer"
          >
            <JobCard job={job} isSponsor={true} />
          </div>
        ))}
      </div>
    </section>
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
      </Modal></>
    
  );
}
