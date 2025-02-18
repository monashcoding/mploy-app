"use client";

// frontend/src/components/ui/no-results.tsx
import { Text } from "@mantine/core";
import { IconInboxOff } from "@tabler/icons-react";
import ResetFilters from "@/components/filters/reset-filters";

export default function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 p-8">
      <IconInboxOff size={64} className="text-gray-400" />
      <Text size="xl" fw={600} ta="center">
        No jobs found
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="max-w-md">
        We couldn&#39;t find any jobs matching your current filters. Try
        adjusting your search criteria.
      </Text>
      <ResetFilters className="block" />
    </div>
  );
}
