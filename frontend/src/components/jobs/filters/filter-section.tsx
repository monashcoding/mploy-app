"use client"

import DropdownFilter from "@/components/jobs/filters/dropdown-filter";
import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/jobs-context";

export default function FilterSection() {
  const { state } = useJobsContext();
  
  // Get filter options from context
  const { state: { filters } } = useJobsContext();
  const studyFields = filters.studyFields;
  const jobTypes = filters.jobTypes;
  const locations = filters.locations;

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
