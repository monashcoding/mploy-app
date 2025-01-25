"use client"
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useJobSearch } from "@/hooks/use-job-search";

export default function SearchBar() {
  const { searchValue, setSearchValue } = useJobSearch();

  return (
    <Input
      placeholder="Search for a company or a role..."
      leftSection={<IconSearch size={16} />}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );
}
