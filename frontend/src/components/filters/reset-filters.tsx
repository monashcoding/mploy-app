// frontend/src/components/ui/reset-filters.tsx
import { Button } from "@mantine/core";
import { useFilterContext } from "@/context/filter/filter-context";
import { IconX } from "@tabler/icons-react";

interface ResetFiltersProps {
  className?: string;
  variant?: string;
}

export default function ResetFilters({
  className = "",
  variant = "light",
}: ResetFiltersProps) {
  const { filters, clearFilters } = useFilterContext();

  // Check if any filters are applied
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

  if (!hasActiveFilters()) {
    return null;
  }

  return (
    <Button
      leftSection={<IconX size={16} />}
      onClick={clearFilters}
      variant={variant}
      radius="lg"
      className={className}
    >
      Reset Filters
    </Button>
  );
}
