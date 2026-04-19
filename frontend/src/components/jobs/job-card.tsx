// frontend/src/components/jobs/job-card.tsx
import { Job } from "@/types/job";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import DOMPurify from "isomorphic-dompurify";
import CompanyLogo from "@/components/jobs/company-logo";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  isSponsor?: boolean;
}

const removeImageTags = (content: string): string => {
  return content.replace(/<img[^>]*>/g, "");
};

export default function JobCard({ job, isSelected, isSponsor }: JobCardProps) {
  const washedDescription = job.one_liner ? removeImageTags(job.one_liner) : "";
  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-150 flex flex-col justify-between
        border overflow-hidden
        ${
          isSelected
            ? "bg-[#2a2a2a] border-[rgba(255,226,47,0.3)]"
            : "bg-secondary border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#333]"
        }`}
    >
      {/* Yellow accent stripe on selected */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-all duration-150 ${
          isSelected ? "bg-[#ffe22f]" : "bg-transparent"
        }`}
      />

      {/* Top section - company info */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-1 min-w-0 gap-3">
            <CompanyLogo
              name={job.company.name}
              applicationUrl={job.application_url}
              logo={job.company.logo}
              className="h-10 w-10 lg:h-10 lg:w-10 rounded-lg flex-shrink-0"
            />
            <div className="flex justify-center flex-col flex-1 min-w-0 gap-0.5">
              <span className="text-sm font-semibold line-clamp-2 leading-tight text-white">
                {job.title}
              </span>
              <span className="text-xs text-[#ffe22f] line-clamp-1 leading-tight">
                {job.company.name}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 flex-shrink-0 mt-0.5">
            {getTimeAgo(job.created_at)}
          </span>
        </div>

        {washedDescription && (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(washedDescription),
            }}
            className="text-xs text-gray-400 line-clamp-2 leading-relaxed"
          />
        )}
      </div>

      {/* Bottom section - badges */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {isSponsor && <Badge text="Sponsored" color="accent" />}
        {job.type && <Badge text={formatCapString(job.type)} />}
        {job.working_rights?.[0] && (
          <Badge
            text={
              job.working_rights.includes("INTERNATIONAL")
                ? "International"
                : "Citizen/PR"
            }
          />
        )}
        {!isSponsor && job.industry_field && (
          <Badge text={formatCapString(job.industry_field)} />
        )}
        {job.locations && job.locations.length > 0 && (
          <Badge
            className="hidden lg:inline"
            text={`${job.locations
              .slice(0, 2)
              .map((loc) => formatCapString(loc))
              .join(", ")}${job.locations.length > 2 ? ", ..." : ""}`}
          />
        )}
      </div>
    </div>
  );
}
