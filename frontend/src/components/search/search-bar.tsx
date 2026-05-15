// frontend/src/components/search/search-bar.tsx
"use client";

import { Input } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFilterContext } from "@/context/filter/filter-context";

export default function SearchBar() {
  const { filters, updateFilters } = useFilterContext();
  const externalSearch = filters.filters.search || "";
  const [searchValue, setSearchValue] = useState(externalSearch);

  useEffect(() => {
    setSearchValue(externalSearch);
  }, [externalSearch]);

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({
      filters: {
        ...filters.filters,
        search: value,
        page: 1,
      },
    });
  }, 150);

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
      onChange={(e) => {
        const value = e.currentTarget.value;
        setSearchValue(value);
        handleSearch(value);
      }}
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
