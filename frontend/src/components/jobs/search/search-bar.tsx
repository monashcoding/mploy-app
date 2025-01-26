"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { useDebouncedCallback } from "@mantine/hooks";

export default function SearchBar() {
  const { filters, updateFilters } = useFilterContext();

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({
      filters: {
        ...filters.filters,
        search: value,
        page: 1, // Reset to first page on new search
      },
    });
  }, 300);

  return (
    <Input
      placeholder="Search for a company or a role..."
      leftSection={<IconSearch size={20} className="ml-2 stroke-primary" />}
      onChange={(e) => handleSearch(e.currentTarget.value)}
      rightSection={
        <Input.ClearButton
          size="md"
          className="absolute pointer-events-auto z-10 right-2"
        />
      }
      variant="filled"
      styles={{
        input: {
          borderRadius: "12px",
          padding: "28px",
          paddingLeft: "40px",
          background: "var(--secondary)",
        },
      }}
    />
  );
}
