// frontend/src/components/jobs/pagination.tsx
"use client";

import { Pagination } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";

interface JobPaginationProps {
  totalJobs: number;
  pageSize?: number;
}

export default function JobPagination({
  totalJobs,
  pageSize = 20,
}: JobPaginationProps) {
  const { filters, updateFilters } = useFilterContext();
  const totalPages = Math.ceil(totalJobs / pageSize);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    updateFilters({
      filters: {
        ...filters.filters,
        page,
      },
    });
  };

  return (
    <div className="flex justify-start py-4">
      <Pagination
        value={filters.filters.page}
        onChange={handlePageChange}
        total={totalPages}
        size="sm"
        radius="md"
        withEdges
      />
    </div>
  );
}
