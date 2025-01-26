"use client";

import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";

export default function FilterSection() {
  const { filters } = useFilterContext();

  return (
    <div className="flex flex-row justify-between items-center my-4 w-full">
      <Text>{filters.totalJobs} Results</Text>
      <div className={"flex flex-row"}></div>
      <DropdownSort />
    </div>
  );
}
