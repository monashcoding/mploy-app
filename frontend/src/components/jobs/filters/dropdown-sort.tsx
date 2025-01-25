import { Select } from "@mantine/core";
import { useJobFilters } from "@/hooks/use-job-filters";

export default function DropdownSort() {
  const { handleFilterChange } = useJobFilters();

  return (
    <Select
      data={[
        { value: "recent", label: "Most Recent" },
        { value: "relevant", label: "Most Relevant" },
      ]}
      defaultValue="recent"
      allowDeselect={false}
      onChange={(value) => 
        handleFilterChange({ sortBy: value as "recent" | "relevant" })
      }
    />
  );
}
