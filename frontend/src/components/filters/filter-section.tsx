"use client";

import { Text } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import DropdownFilter from "@/components/filters/dropdown-filter";
import { INDUSTRY_FIELDS, LOCATIONS, WORKING_RIGHTS } from "@/types/job";
import { useEffect } from "react";

interface FilterSectionProps {
  _totalJobs: number;
}

export default function FilterSection({ _totalJobs }: FilterSectionProps) {
  const { totalJobs, setTotalJobs } = useFilterContext();

  useEffect(() => {
    setTotalJobs(_totalJobs);
  }, [_totalJobs, setTotalJobs]);

  return (
    <div className="flex flex-row justify-between items-center mt-3">
      <Text>{totalJobs} Results</Text>
      <div className={"flex flex-row items-center space-x-2"}>
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
      </div>
      {/*<DropdownSort />*/}
    </div>
  );
}
