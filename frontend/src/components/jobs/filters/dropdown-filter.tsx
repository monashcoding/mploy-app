import { Select } from "@mantine/core";
import { useJobFilters } from "@/hooks/use-job-filters";

interface DropdownFilterProps {
  label: string;
  filterKey: keyof JobFilters;
  options: string[];
}

export default function DropdownFilter({ label, filterKey, options }: DropdownFilterProps) {
  const { handleFilterChange } = useJobFilters();

  return (
    <Select
      placeholder={label}
      data={options}
      multiple={true}
      variant="unstyled"
      searchable
      onChange={(value) => handleFilterChange({ [filterKey]: value })}
    />
  );
}
