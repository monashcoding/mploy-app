import { Select } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import { SortBy } from "@/types/filters"; 

export default function DropdownSort() {
  const { filters, updateFilters } = useFilterContext();

  return (
    <Select
      data={[
        { value: "recent_asc", label: "Newest" },
        { value: "recent_desc", label: "Oldest"},
        { value: "closing_desc", label: "Closing Soon" },
        { value: "closing_asc", label: "Closing Latest" },
      ]}
      value={filters.filters.sortBy}
      onChange={(value) => {
        if (value) {
          updateFilters({
            filters: {
              ...filters.filters,
              sortBy: value as SortBy,
              page: 1
            }
          })
        }
      }}
      allowDeselect={false}
      placeholder="Sort by"
      radius={"md"}
      className="max-w-36"
    />
  );
}
