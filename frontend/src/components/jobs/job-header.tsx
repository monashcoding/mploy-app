// frontend/src/components/jobs/job-header.tsx
import { Text } from "@mantine/core";
import {
  IconMapPin,
  IconCalendar,
  IconBriefcase,
  IconBuilding,
  IconId,
} from "@tabler/icons-react";
import { Job, WORKING_RIGHTS, WorkingRight } from "@/types/job";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import Link from "next/link";
import CompanyLogo from "@/components/jobs/company-logo";

interface JobHeaderProps {
  job: Job;
}

interface InfoTagProps {
  icon: React.ReactNode;
  text: string;
}

const formatWorkingRights = (rights: WorkingRight[]): string => {
  // If all rights are present, return "Any"
  if (rights.length === WORKING_RIGHTS.length) {
    return "Any Working Rights";
  }

  // Check for AUS and NZ Citizens/PR combination
  const hasAus = rights.includes("AUS_CITIZEN_PR");
  const hasNz = rights.includes("NZ_CITIZEN_PR");
  if (hasAus && hasNz) {
    return "AUS & NZ Citizen/PR";
  }

  // Format remaining cases
  return rights
    .map((right) => {
      switch (right) {
        case "AUS_CITIZEN_PR":
          return "AUS Citizen/PR";
        case "NZ_CITIZEN_PR":
          return "NZ Citizen/PR";
        case "INTERNATIONAL":
          return "International";
        case "OTHER_RIGHTS":
          return "Other";
        default:
          return formatCapString(right);
      }
    })
    .join(", ");
};

const InfoTag = ({ icon, text }: InfoTagProps) => (
  <div className="inline-flex items-center gap-1 bg-selected py-1 px-2 rounded-lg">
    {icon}
    <Text size="sm" className="whitespace-normal">
      {text}
    </Text>
  </div>
);

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="flex justify-between w-full pr-2 lg:pr-4">
      <div className="flex flex-col">
        {/* Title with responsive sizing and padding */}
        <span className="text-xl lg:text-2xl font-bold pr-2 lg:pr-16">
          {job.title}
        </span>

        {/* Company name link */}
        <Link
          href={job.company.website || ""}
          target="_blank"
          className="underline mb-2"
        >
          {job.company.name}
        </Link>

        {/* Info tags flexbox container */}
        <div className="flex flex-wrap gap-3">
          {/* Location */}
          <InfoTag
            icon={<IconMapPin size={18} stroke={1.5} />}
            text={job.locations
              ?.map((location) => formatCapString(location))
              .join(", ")}
          />

          {/* Date found */}
          <InfoTag
            icon={<IconCalendar size={18} stroke={1.5} />}
            text={`Found ${getTimeAgo(job.created_at)}`}
          />

          {/* Role type */}
          {job.type && (
            <InfoTag
              icon={<IconBriefcase size={18} stroke={1.5} />}
              text={`${formatCapString(job.type)} Role`}
            />
          )}

          {/* Industry field */}
          {job.industry_field && (
            <InfoTag
              icon={<IconBuilding size={18} stroke={1.5} />}
              text={formatCapString(job.industry_field)}
            />
          )}

          {/* Working Rights */}
          <InfoTag
            icon={<IconId size={18} stroke={1.5} />}
            text={formatWorkingRights(job.working_rights)}
          />
        </div>
      </div>

      {/* Company logo with responsive sizing */}
      <CompanyLogo
        name={job.company.name}
        logo={job.company.logo}
        className="h-12 w-12 lg:h-16 lg:w-16"
      />
    </div>
  );
}
