// frontend/src/components/search/search-bar.tsx
"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { useDebouncedCallback } from "@mantine/hooks";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const { filters, updateFilters } = useFilterContext();
  const [searchValue, setSearchValue] = useState(filters.filters.search || "");

  useEffect(() => {
    setSearchValue(filters.filters.search || "");
  }, [filters.filters.search]);

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({
      filters: {
        ...filters.filters,
        search: value,
        page: 1,
      },
    });
  }, 150);

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  return (
    <Input
      value={searchValue}
      leftSection={
        <IconSearch
          size={16}
          className="ml-2 stroke-[--mantine-color-accent-0]"
        />
      }
      placeholder="Search company or role..."
      onChange={(e) => handleInputChange(e.currentTarget.value)}
      radius="lg"
      variant="filled"
      className="w-full"
      styles={{
        input: {
          padding: "20px",
          paddingLeft: "42px",
          fontSize: "16px",
        },
      }}
    />
  );
}
