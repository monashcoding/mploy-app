"use client";
import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function SearchBar() {
  return (
    <Input
      placeholder="Search for a company or a role..." // not my proudest workaround
      leftSection={<IconSearch size={20} className="ml-2 stroke-primary" />}
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
        },
      }}
    />
  );
}
