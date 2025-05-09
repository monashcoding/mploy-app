// frontend/src/components/filters/filter-section.tsx
"use client";
import { Text } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import { useEffect } from "react";
import FilterModal from "@/components/filters/filter-modal";
import ResetFilters from "@/components/filters/reset-filters";
import DropdownSort from "@/components/filters/dropdown-sort";

interface FilterSectionProps {
  _totalJobs: number;
}

export default function FilterSection({ _totalJobs }: FilterSectionProps) {
  const { totalJobs, setTotalJobs, isLoading } = useFilterContext();

  useEffect(() => {
    setTotalJobs(_totalJobs);
  }, [_totalJobs, setTotalJobs]);

  return (
    <div className="flex justify-between gap-4">
      <Text className={"my-auto text-nowrap"}>
        {isLoading ? "" : totalJobs + " Results"}
      </Text>

      <div className="flex flex-row items-center gap-4">
        <ResetFilters className={"p-0"} />
        <FilterModal />
        <DropdownSort />
      </div>
    </div>
  );
}
