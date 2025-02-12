"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { useDebouncedCallback } from "@mantine/hooks";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const { filters, updateFilters } = useFilterContext();
  const [searchValue, setSearchValue] = useState("");
  
  // To prevent page reload on initial render
  const [isInitialRender, setInitialRender] = useState(true);

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({
      filters: {
        ...filters.filters,
        search: value,
        page: 1,
      },
    });
  }, 100);
  
  useEffect(() => {
    if (isInitialRender) {
      setInitialRender(false);
      return;
    }
    handleSearch(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, handleSearch]);

  return (
    <Input
      leftSection={
        <IconSearch
          size={20}
          className="ml-2 stroke-[--mantine-color-accent-0]"
        />
      }
      rightSection={
        <Input.ClearButton
          onClick={() => setSearchValue("")}
          size="md"
          className="absolute pointer-events-auto z-10 right-2"
        />
      }
      placeholder="Search for a company or a role..."
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      radius="lg"
      variant="filled"
      className="mt-4"
      styles={{
        input: {
          padding: "28px",
          paddingLeft: "40px",
        },
      }}
    />
  );
}
