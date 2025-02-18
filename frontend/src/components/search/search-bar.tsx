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
    console.log("search filter updated");
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
  }, 100);

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  return (
    <Input
      value={searchValue}
      leftSection={
        <IconSearch
          size={20}
          className="ml-2 stroke-[--mantine-color-accent-0]"
        />
      }
      placeholder="Search for a company or a role..."
      onChange={(e) => handleInputChange(e.currentTarget.value)}
      radius="lg"
      variant="filled"
      className="w-full"
      styles={{
        input: {
          padding: "24px",
          paddingLeft: "48px",
        },
      }}
    />
  );
}
