// frontend/src/components/jobs/details/job-details.tsx
"use client";
import { useEffect, useRef } from "react";
import { Button, Card, ScrollArea, Tooltip } from "@mantine/core";
import { IconFolderOpen, IconLink } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/job-description";
import JobHeader from "@/components/jobs/job-header";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever a new job is selected
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0 });
    }
  }, [selectedJob]);

  if (!selectedJob || isLoading) {
    return <JobDetailsLoading />;
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank");
  };

  const handleCopyLink = () => {
    const jobUrl = `${window.location.origin}/jobs/${selectedJob.id}`;
    navigator.clipboard.writeText(jobUrl);
    alert("Job link copied to clipboard!");
  };

  return (
    <Card bd="2px solid selected" className="h-full rounded-xl flex flex-col">
      <ScrollArea type="hover" className="flex-grow" viewportRef={scrollRef}>
        <JobHeader job={selectedJob} />
        <JobDescription description={selectedJob.description || ""} />
      </ScrollArea>

      <div className="flex justify-between items-center mt-4 gap-4">
        <Button
          onClick={handleApplyClick}
          bg="accent"
          c="black"
          leftSection={<IconFolderOpen />}
          className="min-h-10 flex-grow"
        >
          Apply Now
        </Button>
        <Tooltip label="Copy job link" withArrow>
          <Button
            onClick={handleCopyLink}
            variant="light"
            size="md"
            color="gray"
            className="w-50%"
            leftSection={<IconLink size={16} />}
          >
            Copy Link
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
