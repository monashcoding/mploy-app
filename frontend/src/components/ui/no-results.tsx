"use client";

// frontend/src/components/ui/no-results.tsx
import { Button, Text } from "@mantine/core";
import { IconInboxOff } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import Loading from "@/app/jobs/loading";

export default function NoResults() {
  const { clearFilters, isLoading } = useFilterContext();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 px-4">
      <IconInboxOff size={64} className="text-gray-400" />
      <Text size="xl" fw={600} ta="center">
        No jobs found
      </Text>
      <Text size="sm" c="dimmed" ta="center" className="max-w-md">
        We couldn&#39;t find any jobs matching your current filters. Try
        adjusting your search criteria.
      </Text>
      <Button onClick={clearFilters} variant="light" size="md" radius="md">
        Clear All Filters
      </Button>
    </div>
  );
}
