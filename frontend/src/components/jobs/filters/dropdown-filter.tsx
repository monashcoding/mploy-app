import { Select } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/jobs-context";
import { JobFilters } from "@/types/job";

interface DropdownFilterProps {
  label: string;
  filterKey: keyof JobFilters;
  options: string[];
}

export default function DropdownFilter({ label, filterKey, options }: DropdownFilterProps) {
  const { updateFilters } = useJobsContext();

  return (
    <Select
      placeholder={label}
      data={options}
      multiple={true}
      variant="unstyled"
      searchable
      onChange={(value) => updateFilters({ [filterKey]: value })}
    />
  );
}
