import { Select } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/jobs-context";

export default function DropdownSort() {
  const { state, updateFilters } = useJobsContext();

  return (
    <Select
      data={[
        { value: "recent", label: "Most Recent" },
        { value: "relevant", label: "Most Relevant" },
      ]}
      value={state.filters.sortBy}
      allowDeselect={false}
      onChange={(value) =>
        updateFilters({ sortBy: value as "recent" | "relevant" })
      }
      placeholder="Sort by"
      aria-label="Sort jobs"
    />
  );
}
