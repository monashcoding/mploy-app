// frontend/src/components/jobs/job-details.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Modal,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconCheck, IconCopy, IconExternalLink } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/job-description";
import JobHeader from "@/components/jobs/job-header";
import JobDetailsLoading from "@/components/layout/job-details-loading";
import JobSummary from "@/components/jobs/job-summary";
import { upsertLocalStartedApplication } from "@/lib/local-applications";
import { addApplication } from "@/app/my-applications/actions";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const { data: session } = useSession();

  // Scroll to top whenever a new job is selected
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0 });
    }
  }, [selectedJob]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!selectedJob || isLoading) {
    return <JobDetailsLoading />;
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank");

    if (session?.user) {
      addApplication(selectedJob.id, {
        jobId: selectedJob.id,
        title: selectedJob.title,
        companyName: selectedJob.company?.name || "Unknown",
        applicationUrl: selectedJob.application_url,
        logo: selectedJob.company?.logo,
      });
    } else {
      upsertLocalStartedApplication(selectedJob);
      setShowSigninModal(true);
    }
  };

  const handleCopyLink = () => {
    const jobUrl = `${window.location.origin}/jobs/${selectedJob.id}`;
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(jobUrl);
    }

    setIsCopied(true);

    // Reset copied state after 2 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 500);
  };

  return (
    <>
      <Modal
        opened={showSigninModal}
        onClose={() => setShowSigninModal(false)}
        title="Track your applications"
        centered
      >
        <Text size="sm" c="dimmed" mb="md">
          Sign in to track all your applications across devices and manage
          statuses like Applied, Rejected, Accepted, etc.
        </Text>
        <div className="flex gap-3 justify-end">
          <Button variant="default" onClick={() => setShowSigninModal(false)}>
            Not now
          </Button>
          <Button
            component={Link}
            href={`/sign-in?callbackUrl=${encodeURIComponent("/my-applications")}`}
            bg="accent"
            c="black"
            onClick={() => setShowSigninModal(false)}
          >
            Sign in
          </Button>
        </div>
      </Modal>

      <Card bd="2px solid selected" className="h-full rounded-xl flex flex-col">
        <ScrollArea
          offsetScrollbars
          type="hover"
          className="flex-grow"
          viewportRef={scrollRef}
        >
          <JobHeader job={selectedJob} />
          {selectedJob && selectedJob.one_liner && (
            <JobSummary one_liner={selectedJob.one_liner} />
          )}
          {selectedJob && selectedJob.description && (
            <JobDescription description={selectedJob.description || ""} />
          )}
        </ScrollArea>

        <div className="flex justify-between items-center mt-4 gap-4">
          <Button
            onClick={handleApplyClick}
            bg="accent"
            c="black"
            leftSection={<IconExternalLink size={16} />}
            className="flex-grow"
          >
            Apply Now
          </Button>
          <ActionIcon
            onClick={handleCopyLink}
            className="inline lg:hidden py-[1.1rem] w-9"
            size="lg"
            color={"selected"}
            style={{ transition: "color 0.3s ease" }}
          >
            {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
          <Button
            onClick={handleCopyLink}
            color={"selected"}
            className="font-light px-5 hidden lg:inline w-36"
            leftSection={
              isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />
            }
            style={{ transition: "background-color 0.3s ease" }}
          >
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </Card>
    </>
  );
}
