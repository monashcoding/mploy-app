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

interface JobHeaderProps {
  job: Job;
}

function DetailTag({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-[#1f1f1f] py-1.5 px-3 rounded-lg text-sm text-gray-300">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight mb-1">
          {job.title}
        </h1>

        <Link
          href={job.company.website || ""}
          target="_blank"
          className="text-[#ffe22f] hover:underline text-sm mb-4 inline-block"
        >
          {job.company.name}
        </Link>

        <div className="flex flex-wrap gap-2">
          {job.locations && job.locations.length > 0 && (
            <DetailTag
              icon={<IconMapPin size={14} stroke={1.5} className="text-gray-500" />}
              text={job.locations
                .map((location) => formatCapString(location))
                .join(", ")}
            />
          )}

          <DetailTag
            icon={<IconCalendar size={14} stroke={1.5} className="text-gray-500" />}
            text={`Found ${getTimeAgo(job.created_at)}`}
          />

          {job.type && (
            <DetailTag
              icon={<IconBriefcase size={14} stroke={1.5} className="text-gray-500" />}
              text={`${formatCapString(job.type)}`}
            />
          )}

          {job.industry_field && (
            <DetailTag
              icon={<IconBuilding size={14} stroke={1.5} className="text-gray-500" />}
              text={formatCapString(job.industry_field)}
            />
          )}

          {job.working_rights && job.working_rights.length > 0 && (
            <DetailTag
              icon={<IconId size={14} stroke={1.5} className="text-gray-500" />}
              text={formatWorkingRights(job.working_rights)}
            />
          )}
        </div>
      </div>

      <CompanyLogo
        name={job.company.name}
        applicationUrl={job.application_url}
        logo={job.company.logo}
        className="aspect-square h-12 w-12 lg:h-14 lg:w-14 rounded-xl flex-shrink-0"
      />
    </div>
  );
}
