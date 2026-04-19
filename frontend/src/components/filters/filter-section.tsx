// frontend/src/components/filters/filter-section.tsx
"use client";
import { Text, Menu, Button, ActionIcon, Tooltip } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import { useEffect, useState } from "react";
import {
  IconX,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutList,
  IconChevronDown,
} from "@tabler/icons-react";
import { formatCapString } from "@/lib/utils";
import {
  INDUSTRY_FIELDS,
  LOCATIONS,
  WORKING_RIGHTS,
  JOB_TYPES,
} from "@/types/job";
import { ViewMode } from "@/types/filters";

interface FilterSectionProps {
  _totalJobs: number;
}

interface FilterDropdownProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  filterKey: string;
}

function FilterDropdown({
  label,
  options,
  selectedValues,
  filterKey,
}: FilterDropdownProps) {
  const { filters, updateFilters } = useFilterContext();
  const [opened, setOpened] = useState(false);

  const handleToggle = (value: string) => {
    const currentValues = selectedValues;
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

  const isActive = selectedValues.length > 0;

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      shadow="lg"
      radius="md"
      position="bottom-start"
      closeOnItemClick={false}
    >
      <Menu.Target>
        <Button
          size="xs"
          radius="xl"
          variant="filled"
          bg={isActive ? "accent" : "secondary"}
          c={isActive ? "black" : "white"}
          fw={isActive ? 500 : 300}
          rightSection={<IconChevronDown size={14} />}
          className="transition-all duration-150"
        >
          {label}
          {isActive && ` (${selectedValues.length})`}
        </Button>
      </Menu.Target>

      <Menu.Dropdown
        bg="#252525"
        style={{ border: "1px solid #3a3a3a", maxHeight: 280, overflowY: "auto" }}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <Menu.Item
              key={option}
              onClick={() => handleToggle(option)}
              bg={isSelected ? "rgba(255,226,47,0.1)" : "transparent"}
              c={isSelected ? "accent" : "white"}
              className="transition-colors duration-100"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors duration-100 ${
                    isSelected
                      ? "bg-[#ffe22f] border-[#ffe22f]"
                      : "border-[#555] bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path
                        d="M2 5L4 7L8 3"
                        stroke="black"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{formatCapString(option)}</span>
              </div>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}

function ActiveFilterChips() {
  const { filters, updateFilters } = useFilterContext();
  const { jobTypes, locations, workingRights, industryFields } =
    filters.filters;

  const allActive: { key: string; value: string; label: string }[] = [
    ...jobTypes.map((v) => ({
      key: "jobTypes",
      value: v,
      label: formatCapString(v),
    })),
    ...locations.map((v) => ({
      key: "locations",
      value: v,
      label: formatCapString(v),
    })),
    ...workingRights.map((v) => ({
      key: "workingRights",
      value: v,
      label: formatCapString(v),
    })),
    ...industryFields.map((v) => ({
      key: "industryFields",
      value: v,
      label: formatCapString(v),
    })),
  ];

  if (allActive.length === 0) return null;

  const removeFilter = (key: string, value: string) => {
    const currentValues = filters.filters[
      key as keyof typeof filters.filters
    ] as string[];
    updateFilters({
      filters: {
        ...filters.filters,
        [key]: currentValues.filter((v) => v !== value),
        page: 1,
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {allActive.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          onClick={() => removeFilter(chip.key, chip.value)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                     bg-[rgba(255,226,47,0.12)] text-[#ffe22f] border border-[rgba(255,226,47,0.25)]
                     hover:bg-[rgba(255,226,47,0.2)] transition-colors duration-150 cursor-pointer"
        >
          {chip.label}
          <IconX size={12} />
        </button>
      ))}
    </div>
  );
}

const viewModeIcons: { mode: ViewMode; icon: typeof IconLayoutColumns; label: string }[] = [
  { mode: "split", icon: IconLayoutColumns, label: "Split view" },
  { mode: "grid", icon: IconLayoutGrid, label: "Grid view" },
  { mode: "dense", icon: IconLayoutList, label: "List view" },
];

export default function FilterSection({ _totalJobs }: FilterSectionProps) {
  const { totalJobs, setTotalJobs, isLoading, filters, clearFilters, viewMode, setViewMode } =
    useFilterContext();

  useEffect(() => {
    setTotalJobs(_totalJobs);
  }, [_totalJobs, setTotalJobs]);

  const hasActiveFilters = () => {
    const { search, industryFields, jobTypes, locations, workingRights } =
      filters.filters;
    return (
      search !== "" ||
      industryFields.length > 0 ||
      jobTypes.length > 0 ||
      locations.length > 0 ||
      workingRights.length > 0
    );
  };

  return (
    <div className="space-y-2">
      {/* Top row: result count + filter dropdowns + view switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        <Text
          fw={600}
          size="sm"
          className={`text-nowrap mr-1 min-w-[5rem] transition-opacity duration-200 ${
            isLoading ? "opacity-40" : "opacity-100"
          }`}
        >
          {`${totalJobs.toLocaleString()} jobs`}
        </Text>

        <div className="flex items-center gap-2 flex-wrap flex-1">
          <FilterDropdown
            label="Type"
            options={JOB_TYPES}
            selectedValues={filters.filters.jobTypes}
            filterKey="jobTypes"
          />
          <FilterDropdown
            label="Location"
            options={LOCATIONS}
            selectedValues={filters.filters.locations}
            filterKey="locations"
          />
          <FilterDropdown
            label="Rights"
            options={WORKING_RIGHTS}
            selectedValues={filters.filters.workingRights}
            filterKey="workingRights"
          />
          <FilterDropdown
            label="Industry"
            options={INDUSTRY_FIELDS}
            selectedValues={filters.filters.industryFields}
            filterKey="industryFields"
          />

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                         text-gray-400 hover:text-white transition-colors duration-150 cursor-pointer"
            >
              <IconX size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* View mode switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-secondary rounded-xl p-1">
          {viewModeIcons.map(({ mode, icon: Icon, label }) => (
            <Tooltip key={mode} label={label} position="bottom" withArrow>
              <ActionIcon
                size="lg"
                variant={viewMode === mode ? "filled" : "subtle"}
                bg={viewMode === mode ? "accent" : "transparent"}
                c={viewMode === mode ? "black" : "dimmed"}
                onClick={() => setViewMode(mode)}
                radius="md"
                className="transition-all duration-150"
              >
                <Icon size={20} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      <ActiveFilterChips />
    </div>
  );
}
