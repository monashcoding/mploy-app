// frontend/src/components/filters/filter-section.tsx
"use client";
import { Text } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import DropdownFilter from "@/components/filters/dropdown-filter";
import {
  INDUSTRY_FIELDS,
  JOB_TYPES,
  LOCATIONS,
  WORKING_RIGHTS,
} from "@/types/job";
import { useEffect } from "react";
import FilterModal from "@/components/filters/filter-modal";
import ResetFilters from "@/components/filters/reset-filters";

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
      <Text className={"my-auto"}>
        {isLoading ? "" : totalJobs + " Results"}
      </Text>

      <div className="flex flex-row items-center">
        <ResetFilters />

        {/* Desktop filters */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:gap-2">
          <DropdownFilter
            label="Industry"
            filterKey="industryFields"
            options={[...INDUSTRY_FIELDS]}
          />
          <DropdownFilter
            label="Location"
            filterKey="locations"
            options={[...LOCATIONS]}
          />
          <DropdownFilter
            label="Working Right"
            filterKey="workingRights"
            options={[...WORKING_RIGHTS]}
          />
          <DropdownFilter
            label="Job Type"
            filterKey="jobTypes"
            options={[...JOB_TYPES]}
          />
        </div>

        {/* Mobile filter modal button */}
        <div className="lg:hidden">
          <FilterModal />
        </div>
      </div>
    </div>
  );
}
