import { Select } from "@mantine/core";
import { useJobsContext } from "@/context/jobs/jobs-context";

export default function DropdownSort() {
  const { updateFilters } = useJobsContext();

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
