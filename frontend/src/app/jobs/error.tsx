// frontend/src/app/jobs/error.tsx
"use client";

import { useEffect } from "react";
import { Text, Button } from "@mantine/core";

export default function JobError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Jobs page error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Text>
        Oops! Something went wrong while loading the jobs. Please try refreshing
        the page.
      </Text>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
