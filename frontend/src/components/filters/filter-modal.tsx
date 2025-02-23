import { Modal, Button, ScrollArea, Group } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import { FilterSectionGroup } from "./filter-section-group";
import { useFilterContext } from "@/context/filter/filter-context";
import {
  INDUSTRY_FIELDS,
  LOCATIONS,
  WORKING_RIGHTS,
  JOB_TYPES,
} from "@/types/job";
import ResetFilters from "@/components/filters/reset-filters";

export default function FilterModal() {
  const [opened, setOpened] = useState(false);
  const { filters, updateFilters } = useFilterContext();

  const handleToggle = (filterKey: string, value: string) => {
    const currentValues = filters.filters[filterKey] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateFilters({
      filters: {
        ...filters.filters,
        [filterKey]: newValues,
        page: 1,
      },
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpened(true)}
        leftSection={<IconFilter size={16} />}
        variant="light"
        size="sm"
        radius="lg"
      >
        Filters
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="lg"
        title={
          <Group justify="space-between" w="100%">
            <span className={"font-bold"}>Filter Jobs</span>
            <ResetFilters variant="subtle" className="px-0" />
          </Group>
        }
        radius="lg"
        padding="md"
      >
        <ScrollArea h={500} type="scroll" offsetScrollbars>
          <div className="px-2">
            <FilterSectionGroup
              title="Industry"
              options={[...INDUSTRY_FIELDS]}
              selectedValues={filters.filters.industryFields}
              onToggle={(value) => handleToggle("industryFields", value)}
            />

            <FilterSectionGroup
              title="Location"
              options={[...LOCATIONS]}
              selectedValues={filters.filters.locations}
              onToggle={(value) => handleToggle("locations", value)}
            />

            <FilterSectionGroup
              title="Working Rights"
              options={[...WORKING_RIGHTS]}
              selectedValues={filters.filters.workingRights}
              onToggle={(value) => handleToggle("workingRights", value)}
            />

            <FilterSectionGroup
              title="Job Type"
              options={[...JOB_TYPES]}
              selectedValues={filters.filters.jobTypes}
              onToggle={(value) => handleToggle("jobTypes", value)}
            />
          </div>
        </ScrollArea>
      </Modal>
    </>
  );
}
