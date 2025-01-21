import {Select} from "@mantine/core";

interface DropdownFilterProps {
    label: string;
}

export default function DropdownFilter({ label }: DropdownFilterProps) {
  return (
      <Select
          placeholder={label}
          data={["Test", "Test2", "Test3"]}
          multiple={true}
          variant="unstyled"
          searchable
      />
  );
}
