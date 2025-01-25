"use client"
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useJobsContext } from "@/context/jobs/jobs-context";
import { useCallback, useState } from "react";

export default function SearchBar() {
  const { updateFilters } = useJobsContext();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      updateFilters({ search: value });
    },
    [updateFilters]
  );

  return (
    <Input
      placeholder="Search for a company or a role..."
      leftSection={<IconSearch size={16} />}
      value={searchValue}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
