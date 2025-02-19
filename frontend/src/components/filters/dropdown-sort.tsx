import { Select } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";

export default function DropdownSort() {
  const { filters } = useFilterContext();

  return (
    <Select
      data={[
        { value: "recent", label: "Most Recent" },
        { value: "relevant", label: "Most Relevant" },
      ]}
      value={filters.filters.sortBy}
      allowDeselect={false}
      placeholder="Sort by"
      radius={"md"}
      className="max-w-36"
    />
  );
}
