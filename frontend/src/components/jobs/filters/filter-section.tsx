"use client"

import DropdownFilter from "@/components/jobs/filters/dropdown-filter";
import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/jobs-context";

export default function FilterSection() {
  const { state } = useJobsContext();
  
  // These would ideally come from constants or API
  const studyFields = ["Computer Science", "Engineering", "Business"];
  const jobTypes = ["Internship", "Part-time", "Full-time"];
  const locations = ["Sydney", "Melbourne", "Brisbane"];

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
