"use client";

// frontend/src/components/ui/no-results.tsx
import { Button, Text } from "@mantine/core";
import { IconInboxOff } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import Loading from "@/app/loading";

export default function NoResults() {
  const { clearFilters, isLoading } = useFilterContext();

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 px-4">
      {isLoading ? (
        <Loading /> // Use the same loading component as JobList.tsx
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
