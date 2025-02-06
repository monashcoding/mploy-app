// frontend/src/components/ui/section-heading.tsx
import { IconPencil } from "@tabler/icons-react";

interface SectionHeadingProps {
  title: string;
}

export default function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex items-center mb-2">
      <IconPencil size={16} stroke={1.5} />
      <span className="underline-fancy text-lg pl-2">{title}</span>
    </div>
  );
}
