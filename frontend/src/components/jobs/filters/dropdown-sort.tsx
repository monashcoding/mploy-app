import { Select } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/filter-context";

export default function DropdownSort() {
  const { filters, updateFilters } = useJobsContext();

  return (
    <Select
      data={[
        { value: "recent", label: "Most Recent" },
        { value: "relevant", label: "Most Relevant" },
      ]}
      value={filters.filters.sortBy}
      allowDeselect={false}
      onChange={(value) =>
        updateFilters({ sortBy: value as "recent" | "relevant" })
      }
      placeholder="Sort by"
      aria-label="Sort jobs"
    />
  );
}
