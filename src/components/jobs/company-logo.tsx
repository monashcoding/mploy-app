// frontend/src/components/jobs/company-logo.tsx
import { Image } from "@mantine/core";
import { useState } from "react";

interface CompanyLogoProps {
  name: string;
  logo?: string;
  applicationUrl?: string;
  className?: string;
}

export default function CompanyLogo({
  name,
  logo,
  applicationUrl,
  className = "",
}: CompanyLogoProps) {
  const baseClasses = "object-contain rounded-md bg-white";
  const [logoFailed, setLogoFailed] = useState(false);
  const [clearbitFailed, setClearbitFailed] = useState(false);

  // Function to extract base domain from URL
  const extractBaseDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "";
    }
  };

  // Check if URL should be skipped for logo generation
  const shouldSkipUrl = (url: string): boolean => {
    const skipDomains = [
      "bit.ly",
      "tinyurl.com",
      "goo.gl",
      "gradconnection.com",
      "gradconnect.com",
      "prosple.com",
      "linkedin.com",
      "lnkd.in",
      "surveymonkey.com",
      "forms.gle",
    ];

    try {
      const domain = new URL(url).hostname;
      return skipDomains.some((skipDomain) => domain.includes(skipDomain));
    } catch {
      return true;
    }
  };

  // Render the fallback with first letter or question mark
  const renderFallback = () => {
    return (
      <div
        className={`${baseClasses} flex items-center justify-center ${className}`}
      >
        <div>{name ? name.charAt(0).toUpperCase() : "?"}</div>
      </div>
    );
  };

  // Case 1: Try company logo first
  if (logo && !logoFailed) {
    return (
      <Image
        alt={name || "Company"}
        src={logo}
        className={`${baseClasses} ${className}`}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  // Case 2: Try Clearbit logo from application URL
  if (applicationUrl && !shouldSkipUrl(applicationUrl) && !clearbitFailed) {
    const domain = extractBaseDomain(applicationUrl);
    if (domain) {
      return (
        <Image
          alt={name || "Company"}
          src={`https://logo.clearbit.com/${domain}`}
          className={`${baseClasses} ${className}`}
          onError={() => setClearbitFailed(true)}
        />
      );
    }
  }

  // Case 3 & 4: Fallback to initial letter or question mark
  return renderFallback();
}
