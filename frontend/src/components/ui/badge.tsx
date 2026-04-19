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
      fw={400}
      className={className}
      tt="none"
      color={color}
      size={size}
      radius="md"
      autoContrast
      styles={{
        root: {
          border: color === "accent" ? undefined : "1px solid rgba(255,255,255,0.08)",
        },
      }}
    >
      {text}
    </MantineBadge>
  );
}
