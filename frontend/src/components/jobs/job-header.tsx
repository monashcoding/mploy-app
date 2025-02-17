// frontend/src/components/jobs/details/sections/job-header.tsx
import { Divider, Text, Group } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { Job } from "@/types/job";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import CompanyLogo from "@/components/jobs/company-logo";

interface JobHeaderProps {
  job: Job;
}

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="flex justify-between w-full pr-4">
      <div className="flex flex-col space-y-1">
        <span className="text-2xl font-bold pr-16 ">{job.title}</span>
        <Link href={job.company.website + ""} target="_blank">
          <span className="underline mb-4 mt-4">{job.company.name}</span>
        </Link>

        <div className="flex items-center space-y-1 space-x-2 flex-wrap pr-8">
          <IconMapPin size={20} stroke={1.5} />
          {job.locations?.map((location) => (
            <Badge key={location} text={formatCapString(location)} size="lg" />
          ))}
          <Group>
            <Divider size={2} color="accent" orientation="vertical" />
            <Text size="sm">Found {getTimeAgo(job.created_at)}</Text>
            {job.type && (
              <>
                <Divider size={2} color="accent" orientation="vertical" />
                <Text size="sm">
                  {job.type && formatCapString(job.type)} Role
                </Text>
              </>
            )}
            {job.industry_field && (
              <>
                <Divider size={2} color="accent" orientation="vertical" />
                <Text size="sm">{formatCapString(job.industry_field)}</Text>
              </>
            )}
          </Group>
        </div>
      </div>
      <CompanyLogo
        name={job.company.name}
        logo={job.company.logo}
        className="h-20 w-20"
      />
    </div>
  );
}
