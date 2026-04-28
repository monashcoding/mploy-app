// frontend/src/components/jobs/filters/dropdown-filter.tsx
import {
  Checkbox,
  Combobox,
  Group,
  Input,
  Text,
  useCombobox,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useFilterContext } from "@/context/filter/filter-context";
import { JobFilters } from "@/types/filters";
import { formatCapString, getPluralLabel } from "@/lib/utils";

interface DropdownFilterProps {
  label: string;
  filterKey: keyof JobFilters;
  options: string[];
}

export default function DropdownFilter({
  label,
  filterKey,
  options,
}: DropdownFilterProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const { filters, updateFilters } = useFilterContext();
  const selected = (filters.filters[filterKey] as string[]) || [];

  const handleValueSelect = (value: string) => {
    const newValues = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    updateFilters({
      filters: {
        ...filters.filters,
        [filterKey]: newValues,
        page: 1,
      },
    });
  };

  const getDisplayText = () => {
    if (selected.length === 0) return label;
    if (selected.length === 1) return formatCapString(selected[0]);
    return `${selected.length} ${getPluralLabel(label)}`;
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.Target>
        <Input
          component="button"
          type="button"
          radius={"lg"}
          pointer
          rightSection={<IconChevronDown size={16} />}
          onClick={() => combobox.toggleDropdown()}
          className={`min-w-32`}
        >
          <Text size="sm" color={selected.length > 0 ? "light" : "dimmed"}>
            {getDisplayText()}
          </Text>
        </Input>
      </Combobox.Target>

      <Combobox.Dropdown className={`min-w-56`}>
        <Combobox.Options>
          {options.map((option) => (
            <Combobox.Option
              value={option}
              key={option}
              active={selected.includes(option)}
            >
              <Group gap="sm">
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={() => {}}
                  aria-hidden
                  tabIndex={-1}
                  style={{ pointerEvents: "none" }}
                />
                <span>{formatCapString(option)}</span>
              </Group>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
