// frontend/src/components/jobs/pagination.tsx
"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";

interface JobPaginationProps {
  pageSize?: number;
}

export default function JobPagination({ pageSize = 20 }: JobPaginationProps) {
  const [isReady, setIsReady] = useState(false);
  const { filters, updateFilters, totalJobs } = useFilterContext();

  useEffect(() => {
    if (totalJobs !== undefined) {
      setIsReady(true);
    }
  }, [totalJobs]);

  const totalPages = Math.ceil(totalJobs / pageSize);

  if (!isReady || totalPages <= 1) return null;

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
