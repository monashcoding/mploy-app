"use client"

import DropdownFilter from "@/components/jobs/filters/dropdown-filter";
import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";
import { useJobsContext, initialFilters } from "@/context/jobs/jobs-context";

export default function FilterSection() {
  const { state } = useJobsContext();
  
  // Get filter options from initial filters
  const studyFields = initialFilters.studyFields;
  const jobTypes = initialFilters.jobTypes;
  const locations = initialFilters.locations;

  return (
    <div className="flex flex-row justify-between items-center my-4 w-full">
      <Text>{state.totalJobs} Results</Text>
      <div className={"flex flex-row"}>
        <DropdownFilter 
          label="Study Fields" 
          filterKey="studyFields" 
          options={studyFields} 
        />
        <DropdownFilter 
          label="Job Type" 
          filterKey="jobTypes" 
          options={jobTypes} 
        />
        <DropdownFilter 
          label="Location" 
          filterKey="locations" 
          options={locations} 
        />
      </div>
      <DropdownSort />
    </div>
  );
}
