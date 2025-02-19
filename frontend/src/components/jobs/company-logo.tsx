// frontend/src/components/ui/company-logo.tsx
import { Image } from "@mantine/core";

interface CompanyLogoProps {
  name: string;
  logo?: string;
  className?: string;
}

export default function CompanyLogo({
  name,
  logo,
  className = "",
}: CompanyLogoProps) {
  const baseClasses = "object-contain rounded-md bg-white";

  if (logo) {
    return (
      <Image alt={name} src={logo} className={`${baseClasses} ${className}`} />
    );
  }

  return (
    <div
      className={`${baseClasses} flex items-center justify-center ${className}`}
    >
      <div>{name.charAt(0).toUpperCase()}</div>
    </div>
  );
}
