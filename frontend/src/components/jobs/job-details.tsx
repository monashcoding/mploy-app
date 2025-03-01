// frontend/src/components/jobs/details/job-details.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, ScrollArea } from "@mantine/core";
import {
  IconCopyCheckFilled,
  IconFolderOpen,
  IconLink,
} from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import JobDescription from "@/components/jobs/job-description";
import JobHeader from "@/components/jobs/job-header";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const [alertStyle, setAlertStyle] = useState<React.CSSProperties>({});
  const timeoutRef = useRef<number | null>(null);

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
    setAlertVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Calculate button's position and set notification style so it's centered above the button
    if (copyButtonRef.current) {
      const rect = copyButtonRef.current.getBoundingClientRect();
      // Compute the center of the button horizontally.
      const left = rect.left + rect.width / 2;
      // Place the notification a bit above the button.
      const bottom = window.innerHeight - rect.top + 10; // 10px above the button
      setAlertStyle({
        position: "fixed",
        left: left,
        bottom: bottom,
        width: "140px",
        fontSize: "0.5rem",
        padding: "4px",
        transform: "translateX(-50%)",
        zIndex: 1000,
      });

      // Hide the alert after 3 seconds
      timeoutRef.current = window.setTimeout(() => {
        setAlertVisible(false);
      }, 2000);
    }
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
          size="sm"
          leftSection={<IconFolderOpen />}
          className="min-h-10 flex-grow"
        >
          Apply Now
        </Button>
        <Button
          ref={copyButtonRef}
          onClick={handleCopyLink}
          variant="light"
          size="sm"
          color="gray"
          className="w-50% min-h-10"
          leftSection={<IconLink size={16} />}
        >
          Copy Link
        </Button>
      </div>
      {alertVisible && (
        <Alert
          icon={<IconCopyCheckFilled size={16} />}
          color="black"
          autoContrast
          variant="filled"
          title="Link Copied!"
          withCloseButton={false}
          style={alertStyle}
        ></Alert>
      )}
    </Card>
  );
}
