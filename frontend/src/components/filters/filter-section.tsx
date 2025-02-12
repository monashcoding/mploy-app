"use client";

import { Text, Button } from "@mantine/core";
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

interface FilterSectionProps {
  _totalJobs: number;
}

export default function FilterSection({ _totalJobs }: FilterSectionProps) {
  const { totalJobs, setTotalJobs, clearFilters } = useFilterContext();

  useEffect(() => {
    setTotalJobs(_totalJobs);
  }, [_totalJobs, setTotalJobs]);

  return (
    <div className="flex flex-row justify-between items-center">
      <Text>{totalJobs} Results</Text>
      <div className="flex flex-row items-center space-x-2">
        {/* Show filters in desktop */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:space-x-2 lg:justify-center">
          <Button
            className=" border-5 rounded-3xl"
            size="compact-md"
            variant="transparent"
            onClick={() => clearFilters()}
          >
            <a className="font-light">Clear all</a>
          </Button>
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
            label="Job Types"
            filterKey="jobTypes"
            options={[...JOB_TYPES]}
          />
        </div>
        <FilterModal />
      </div>
    </div>
  );
}
