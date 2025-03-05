// frontend/src/components/ui/badge.tsx
import { Badge as MantineBadge } from "@mantine/core";

interface BadgeProps {
  text: string;
  size?: "sm" | "lg";
  className?: string;
  color?: string;
}

export default function Badge({
  text,
  size = "sm",
  className = "",
  color = "dark.4",
}: BadgeProps) {
  return (
    <MantineBadge
      fw={300}
      className={className}
      tt="none"
      color={color}
      size={size}
      radius={size === "lg" ? "lg" : "md"}
      autoContrast
    >
      {text}
    </MantineBadge>
  );
}
