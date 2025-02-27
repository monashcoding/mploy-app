// frontend/src/components/jobs/job-header.tsx
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconId,
  IconMapPin,
} from "@tabler/icons-react";
import { Job } from "@/types/job";
import { formatCapString, formatWorkingRights, getTimeAgo } from "@/lib/utils";
import Link from "next/link";
import CompanyLogo from "@/components/jobs/company-logo";
import { InfoTag } from "@/components/jobs/info-tag";

interface JobHeaderProps {
  job: Job;
}

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-col lg:mr-2">
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
          {job.working_rights && (
            <InfoTag
              icon={<IconId size={18} stroke={1.5} />}
              text={formatWorkingRights(job.working_rights)}
            />
          )}
        </div>
      </div>

      {/* Company logo with responsive sizing */}
      <CompanyLogo
        name={job.company.name}
        logo={job.company.logo}
        className="aspect-square h-12 w-12 lg:h-16 lg:w-16"
      />
    </div>
  );
}
