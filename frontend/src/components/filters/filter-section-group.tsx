// frontend/src/components/filters/filter-section-group.tsx
import { Text } from "@mantine/core";
import { ToggleTag } from "./toggle-tag";
import { formatCapString } from "@/lib/utils";

interface FilterSectionGroupProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export function FilterSectionGroup({
  title,
  options,
  selectedValues,
  onToggle,
}: FilterSectionGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-row">
        <Text size="sm" fw={600} className="mb-2">
          {title}
        </Text>
      </div>

      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <ToggleTag
            key={option}
            label={formatCapString(option)}
            isSelected={selectedValues.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>
    </div>
  );
}
