"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function SearchBar() {

  return (
    <Input
      placeholder="Search for a company or a role..."
      leftSection={<IconSearch size={16} />}
    />
  );
}
