"use client"
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useJobsContext } from "@/context/jobs/jobs-context";

export default function SearchBar() {
  const { updateFilters } = useJobsContext();

  return (
    <Input
      placeholder="Search for a company or a role..."
      leftSection={<IconSearch size={16} />}
      onChange={(e) => updateFilters({ search: e.target.value })}
    />
  );
}
