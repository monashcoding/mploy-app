// frontend/src/components/jobs/details/job-details.tsx
"use client";
import { useEffect, useRef } from "react";
import { Button, Card, ScrollArea } from "@mantine/core";
import { IconFolderOpen } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/job-description";
import JobWorkingRights from "@/components/jobs/job-working-rights";
import JobHeader from "@/components/jobs/job-header";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever a new job is selected
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedJob]);

  if (!selectedJob || isLoading) {
    return <JobDetailsLoading />;
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank");
  };

  return (
    <Card bd="2px solid selected" className="h-full rounded-xl flex flex-col">
      <ScrollArea
        type="hover"
        className="pl-4 flex-grow"
        viewportRef={scrollRef}
      >
        <JobHeader job={selectedJob} />
        <JobDescription description={selectedJob.description || ""} />
        <JobWorkingRights rights={selectedJob.working_rights} />
      </ScrollArea>

      <Button
        onClick={handleApplyClick}
        bg="accent"
        c="black"
        leftSection={<IconFolderOpen />}
        className="min-h-10 mt-4"
      >
        Apply Now
      </Button>
    </Card>
  );
}
