// frontend/src/components/ui/section-heading.tsx
interface SectionHeadingProps {
  title: string;
  icon: React.ReactNode;
}

export default function SectionHeading({ title, icon }: SectionHeadingProps) {
  return (
    <div className="flex items-center mb-2">
      {icon}
      <span className="underline-fancy text-lg pl-2">{title}</span>
    </div>
  );
}
