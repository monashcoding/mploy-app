// frontend/src/components/jobs/job-card-grid.tsx
import { Job } from "@/types/job";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import CompanyLogo from "@/components/jobs/company-logo";

interface JobCardGridProps {
  job: Job;
  isSponsor?: boolean;
}

export default function JobCardGrid({ job, isSponsor }: JobCardGridProps) {
  return (
    <div
      className="rounded-xl p-4 bg-secondary border border-[rgba(255,255,255,0.06)]
        hover:border-[rgba(255,255,255,0.15)] hover:bg-[#333]
        transition-all duration-150 flex flex-col justify-between h-full cursor-pointer"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <CompanyLogo
            name={job.company.name}
            applicationUrl={job.application_url}
            logo={job.company.logo}
            className="h-9 w-9 rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold line-clamp-2 leading-tight text-white block">
              {job.title}
            </span>
            <span className="text-xs text-[#ffe22f] block mt-0.5">
              {job.company.name}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">
          {job.locations
            ?.slice(0, 2)
            .map((loc) => formatCapString(loc))
            .join(", ")}{" "}
          · {getTimeAgo(job.created_at)}
        </div>
      </div>

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
      </div>
    </div>
  );
}
