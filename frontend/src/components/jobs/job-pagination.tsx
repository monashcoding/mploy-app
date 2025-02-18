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
    <div className="flex justify-center py-4">
      <Pagination
        autoContrast
        value={filters.filters.page}
        onChange={handlePageChange}
        total={totalPages}
        siblings={1}
        size="md"
        gap={12}
        radius="lg"
        color="accent"
        getItemProps={(page) => ({
          disabled: page === filters.filters.page,
          "aria-current": page === filters.filters.page ? "page" : undefined,
          className: page === filters.filters.page ? "!opacity-100" : "",
        })}
      />
    </div>
  );
}
