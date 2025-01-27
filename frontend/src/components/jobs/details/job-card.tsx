// frontend/src/components/jobs/details/job-card.tsx
import { Badge, Box, Image } from "@mantine/core";
import { Job } from "@/types/job";
import { IconMapPin } from "@tabler/icons-react";
import { formatCapString, getTimeAgo } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
}

export default function JobCard({ job, isSelected }: JobCardProps) {
  return (
    // Have to use Box here since I can't define bg-[--mantine-color-selected].
    // It requires a shade e.g. bg-[--mantine-color-selected.0], which results
    // in breaking changes between light and dark mode.
    <Box
      bg={isSelected ? "selected" : "secondary"}
      bd="1px solid selected"
      className={`h-[10rem] p-4 rounded-xl transition-colors`}
    >
      <div className={"flex justify-between"}>
        <div className={"flex"}>
          <Image
            alt={job.company.name}
            src={job.company.logo}
            h={60}
            w={60}
            className={"mr-2 object-contain rounded-md bg-white"}
          />
          <div className={"flex justify-center flex-col max-w-64 space-y-0.5"}>
            <span className="text-md font-bold truncate leading-tight">
              {job.title}
            </span>
            <span className="text-xs truncate">{job.company.name}</span>
            <span className="text-xs flex items-center gap-1">
              <IconMapPin size={12} />
              {job.locations[0]}
            </span>
          </div>
        </div>
        <span className={"text-xs"}>{getTimeAgo(job.updated_at)}</span>
      </div>
      <div className={"text-xs line-clamp-2 mt-2"}>{job.description}</div>
      <div className={"mt-1"}>
        {job.type && (
          <Badge fw="300" tt="none" color="dark.4" size="sm">
            {formatCapString(job.type)}
          </Badge>
        )}
      </div>
    </Box>
  );
}
