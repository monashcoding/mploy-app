// frontend/src/components/jobs/job-details.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Button, ScrollArea } from "@mantine/core";
import { IconCheck, IconCopy, IconExternalLink } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/job-description";
import JobHeader from "@/components/jobs/job-header";
import JobDetailsLoading from "@/components/layout/job-details-loading";
import JobSummary from "@/components/jobs/job-summary";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top whenever a new job is selected
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedJob]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!selectedJob) {
    return <JobDetailsLoading />;
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank");
  };

  const handleCopyLink = () => {
    const jobUrl = `${window.location.origin}/jobs/${selectedJob.id}`;
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(jobUrl);
    }

    setIsCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col rounded-xl border border-[rgba(255,255,255,0.06)] bg-secondary overflow-hidden">
      <ScrollArea
        offsetScrollbars
        type="hover"
        className="flex-grow"
        viewportRef={scrollRef}
      >
        <div className="p-5 lg:p-6">
          <JobHeader job={selectedJob} />
          {selectedJob.one_liner && (
            <JobSummary one_liner={selectedJob.one_liner} />
          )}
          {selectedJob.description && (
            <JobDescription description={selectedJob.description} />
          )}
        </div>
      </ScrollArea>

      {/* Sticky footer */}
      <div className="flex items-center gap-3 px-5 lg:px-6 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <Button
          onClick={handleApplyClick}
          bg="accent"
          c="black"
          fw={600}
          leftSection={<IconExternalLink size={16} />}
          className="flex-grow"
          radius="md"
          size="md"
        >
          Apply Now
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="subtle"
          c="dimmed"
          className="px-3 hidden lg:inline-flex"
          leftSection={
            isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />
          }
          radius="md"
          size="md"
        >
          {isCopied ? "Copied!" : "Copy Link"}
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="subtle"
          c="dimmed"
          className="px-2 lg:hidden"
          radius="md"
          size="md"
        >
          {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </Button>
      </div>
    </div>
  );
}
