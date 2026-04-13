// frontend/src/components/search/search-bar.tsx
"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { useDebouncedCallback } from "@mantine/hooks";
import { useEffect, useRef } from "react";

export default function SearchBar() {
  const { filters, updateFilters } = useFilterContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input DOM value when context changes externally (e.g. filters cleared)
  useEffect(() => {
    if (
      inputRef.current &&
      inputRef.current.value !== (filters.filters.search || "")
    ) {
      inputRef.current.value = filters.filters.search || "";
    }
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

  return (
    <Input
      ref={inputRef}
      defaultValue={filters.filters.search || ""}
      leftSection={
        <IconSearch
          size={16}
          className="ml-2 stroke-[--mantine-color-accent-0]"
        />
      }
      placeholder="Search company or role..."
      onChange={(e) => handleSearch(e.currentTarget.value)}
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
