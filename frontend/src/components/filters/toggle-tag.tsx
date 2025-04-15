// frontend/src/components/filters/toggle-tag.tsx
import { Button } from "@mantine/core";

interface ToggleTagProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ToggleTag({ label, isSelected, onClick }: ToggleTagProps) {
  return (
    <Button
      variant="filled"
      size="xs"
      radius="xl"
      onClick={onClick}
      c={isSelected ? "black" : "white"}
      bg={isSelected ? "accent" : "secondary"}
      className={`m-1 text-white ${!isSelected && "font-light"}`}
    >
      {label}
    </Button>
  );
}
