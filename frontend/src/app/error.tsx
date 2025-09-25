"use client";

import { useEffect } from "react";
import { Text, Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Text>
        Oops! Something went wrong. Please try refreshing the page or contact
        support if the issue persists.
      </Text>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
