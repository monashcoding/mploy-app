// frontend/src/components/ui/badge.tsx
import { Badge as MantineBadge } from "@mantine/core";

interface BadgeProps {
  text: string;
  size?: "sm" | "lg";
  className?: string;
}

export default function Badge({
  text,
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <MantineBadge
      fw={300}
      className={className}
      tt="none"
      color="dark.4"
      size={size}
      radius={size === "lg" ? "lg" : "md"}
    >
      {text}
    </MantineBadge>
  );
}
