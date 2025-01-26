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
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Text>
        Failed to render jobs page. Check the console for more details.
      </Text>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
