// frontend/src/components/jobs/details/job-card.tsx
import { Badge, Image } from "@mantine/core";
import { Job } from "@/types/job";
import { IconMapPin } from "@tabler/icons-react";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
}

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}d ago`;
}

export default function JobCard({ job, isSelected }: JobCardProps) {
  return (
    <div
      className={`h-[152px] p-4 rounded-xl transition-colors ${
        isSelected ? "bg-selected" : "bg-secondary hover:bg-selected"
      }`}
    >
      {/* Header Section */}
      <div className="flex justify-between mb-2">
        {/* Logo and Title Section */}
        <div className="flex gap-2 flex-1">
          <Image
            alt={job.company.name}
            src={job.company.logo}
            radius="md"
            fit="contain"
            h={50}
            w={50}
            style={{ backgroundColor: "white", marginRight: "0px" }}
          />

          <div className="flex-1 min-w-0 mt-[-2px]">
            <p className="text-sm font-bold max-w-72 truncate">{job.title}</p>
            <p className="text-xs truncate">{job.company.name}</p>
            <div className="flex items-center gap-1">
              <IconMapPin size={10} />
              <p className="text-[10px] font-thin">{job.locations[0]}</p>
            </div>
          </div>
        </div>

        {/* Posted Time */}
        <span className="text-xs mt-[-4px] text-gray-400">
          {getTimeAgo(job.updated_at)}
        </span>
      </div>

      {/* Description Section */}
      <p className="text-xs mb-3 line-clamp-2">
        {truncateText(job.description || "", 150)}
      </p>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-1">
        {job.type && (
          <Badge
            style={{ fontWeight: 300 }}
            color="dark.4"
            radius="md"
            size="sm"
          >
            {job.type}
          </Badge>
        )}
        {job.working_rights?.[0] && (
          <Badge
            style={{ fontWeight: 300 }}
            color="dark.4"
            radius="md"
            size="sm"
          >
            {job.working_rights[0] === "VISA_SPONSORED"
              ? "Visa-Friendly"
              : "Citizen/PR"}
          </Badge>
        )}
        {job.industry && (
          <Badge
            style={{ fontWeight: 300 }}
            color="dark.4"
            radius="md"
            size="sm"
          >
            {job.industry}
          </Badge>
        )}
      </div>
    </div>
  );
}
