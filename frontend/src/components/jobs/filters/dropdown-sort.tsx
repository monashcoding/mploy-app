import { Select } from "@mantine/core";

// combobox mantine?
export default function DropdownSort() {
  return (
    <Select
      data={["Ascending", "Descending"]}
      defaultValue="Ascending"
      allowDeselect={false}
    />
  );
}
