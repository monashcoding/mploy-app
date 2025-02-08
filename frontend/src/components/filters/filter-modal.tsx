// frontend/src/components/jobs/filters/filter-modal.tsx
import { Modal, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import DropdownFilter from "./dropdown-filter";
import { INDUSTRY_FIELDS, LOCATIONS, WORKING_RIGHTS } from "@/types/job";
import { useFilterContext } from "@/context/filter/filter-context";

export default function FilterModal() {
  const [opened, setOpened] = useState(false);
  const fc = useFilterContext();

  return (
    <>
      <Button
        onClick={() => setOpened(true)}
        leftSection={<IconFilter size={16} />}
        className="lg:hidden"
        variant="light"
        size="sm"
        radius="lg"
      >
        Filters
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Filter Jobs"
        size="lg"
        radius={"lg"}
        styles={{
          body: {
            height: "calc(100vh - 200px)", // Leave space for header/footer
          },
        }}
      >
        <div className="flex flex-col space-y-6 px-6">
          <DropdownFilter
            label="Industry"
            filterKey="industryFields"
            options={[...INDUSTRY_FIELDS]}
          />
          <DropdownFilter
            label="Location"
            filterKey="locations"
            options={[...LOCATIONS]}
          />
          <DropdownFilter
            label="Working Right"
            filterKey="workingRights"
            options={[...WORKING_RIGHTS]}
          />
                              <Button className=" border-5 rounded-3xl" size="compact-md" variant="transparent" onClick={() => fc.clearFilters()}>
                        <a className="font-light">
                            clear all
                        </a>
                    </Button>

        </div>
      </Modal>
    </>
  );
}
