// frontend/src/components/jobs/details/job-details.tsx
"use client";

import { Button, Card, ScrollArea } from "@mantine/core";
import { IconFolderOpen } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/details/job-description";
import JobWorkingRights from "@/components/jobs/details/job-working-rights";
import JobHeader from "@/components/jobs/details/job-header";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();

  if (!selectedJob || isLoading) {
    return (
      <div className="hidden lg:block">
        <div className="h-[calc(100vh-330px)] bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank");
  };

  return (
    <Card bd="2px solid selected" className="h-full rounded-xl">
      <ScrollArea type="hover" className="pl-4 pt-2">
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
