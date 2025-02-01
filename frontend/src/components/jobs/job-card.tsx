// frontend/src/components/jobs/details/job-card.tsx
import { Box, Image } from "@mantine/core";
import { Job } from "@/types/job";
import { IconMapPin } from "@tabler/icons-react";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import DOMPurify from "isomorphic-dompurify";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
}

export default function JobCard({ job, isSelected }: JobCardProps) {
  return (
    <Box
      bg={isSelected ? "selected" : "secondary"}
      bd="2px solid selected"
      className={`h-[10.5rem] p-4 rounded-xl transition-colors`}
    >
      <div className={"flex justify-between"}>
        <div className={"flex flex-1 min-w-0"}>
          <Image
            alt={job.company.name}
            src={job.company.logo}
            className={
              "mr-2 h-14 w-14 object-contain rounded-md bg-white flex-shrink-0"
            }
          />
          <div
            className={
              "flex justify-center flex-col flex-1 min-w-0 space-y-0.5"
            }
          >
            <span className="text-md font-bold truncate leading-tight pr-2">
              {job.title}
            </span>
            <span className="text-xs truncate">{job.company.name}</span>
            <span className="text-xs flex items-center gap-1">
              <IconMapPin size={12} />
              {formatCapString(job.locations[0])}
            </span>
          </div>
        </div>
        <span className={"text-xs flex-shrink-0"}>
          {getTimeAgo(job.updated_at)}
        </span>{" "}
        {/* Added flex-shrink-0 */}
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(job.description || ""),
        }}
        className={
          "text-xs [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm max-w-none line-clamp-2 mt-2 prose max-h-[4em]"
        }
      />
      <div className={"mt-2 flex gap-2"}>
        {job.type && <Badge text={formatCapString(job.type)} />}
        {job.working_rights?.[0] && (
          <Badge
            text={
              job.working_rights[0] === "VISA_SPONSORED"
                ? "Visa-Friendly"
                : "Citizen/PR"
            }
          />
        )}
        {job.industry_field && (
          <Badge text={formatCapString(job.industry_field)} />
        )}
      </div>
    </Box>
  );
}
