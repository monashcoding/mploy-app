// frontend/src/components/ui/badge.tsx
import { Badge as MantineBadge } from "@mantine/core";

interface BadgeProps {
  text: string;
  size?: "sm" | "lg";
}

export default function Badge({ text, size = "sm" }: BadgeProps) {
  return (
    <MantineBadge
      fw={300}
      tt="none"
      color="dark.4"
      size={size}
      radius={size === "lg" ? "lg" : "md"}
    >
      {text}
    </MantineBadge>
  );
}
