import DropdownFilter from "@/components/jobs/filters/dropdown-filter";
import DropdownSort from "@/components/jobs/filters/dropdown-sort";
import { Text } from "@mantine/core";

export default function FilterSection() {
  return (
    <div className="flex flex-row justify-between items-center my-4 w-full">
      <Text>196 Results</Text>
      <div className={"flex flex-row"}>
        <DropdownFilter label="Study Fields" />
        <DropdownFilter label="Job Type" />
        <DropdownFilter label="Location" />
      </div>
      <DropdownSort />
    </div>
  );
}
