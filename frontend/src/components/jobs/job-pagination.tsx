// frontend/src/components/jobs/pagination.tsx
"use client";

import { Pagination } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";

interface JobPaginationProps {
  pageSize?: number;
}

export default function JobPagination({ pageSize = 20 }: JobPaginationProps) {
  const { filters, updateFilters, totalJobs, isLoading } = useFilterContext();
  const totalPages = Math.ceil(totalJobs / pageSize);

  if (totalPages <= 1 || isLoading) return null;

  const handlePageChange = (page: number) => {
    const scrollContainer = document.querySelector("#job-list-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    updateFilters({
      filters: {
        ...filters.filters,
        page,
      },
    });
  };

  return (
    // mb-12 gives extra space for feedback button on mobile. it would've blocked the pagination controls.
    <div className="flex justify-center py-4 mb-12 sm:mb-0">
      <Pagination
        autoContrast
        value={filters.filters.page}
        onChange={handlePageChange}
        total={totalPages}
        size="md"
        gap={12}
        boundaries={1}
        siblings={1}
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
