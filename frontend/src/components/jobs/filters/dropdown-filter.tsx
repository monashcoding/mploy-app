import { Select } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import { JobFilters } from "@/types/filters";

interface DropdownFilterProps {
  label: string;
  filterKey: keyof JobFilters;
  options: string[];
}

export default function DropdownFilter({
  label,
  filterKey,
  options,
}: DropdownFilterProps) {
  const { updateFilters } = useFilterContext();

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
