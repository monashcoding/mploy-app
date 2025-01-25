"use client";

import DropdownFilter from "@/components/jobs/filters/dropdown-filter";
import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/filter-context";
import { JOB_TYPES, STUDY_FIELDS } from "@/types/filters";

export default function FilterSection() {
  const { filters } = useJobsContext();

  return (
    <div className="flex flex-row justify-between items-center my-4 w-full">
      <Text>{filters.totalJobs} Results</Text>
      <div className={"flex flex-row"}>
        <DropdownFilter
          label="Study Fields"
          filterKey="studyFields"
          options={STUDY_FIELDS}
        />
        <DropdownFilter
          label="Job Type"
          filterKey="jobTypes"
          options={JOB_TYPES}
        />
      </div>
      <DropdownSort />
    </div>
  );
}
