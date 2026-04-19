// frontend/src/components/jobs/job-card-dense.tsx
import { Job } from "@/types/job";
import { formatCapString, getTimeAgo } from "@/lib/utils";
import CompanyLogo from "@/components/jobs/company-logo";
import { IconChevronRight } from "@tabler/icons-react";

interface JobCardDenseProps {
  job: Job;
  isSelected?: boolean;
}

export default function JobCardDense({ job, isSelected }: JobCardDenseProps) {
  return (
    <div
      className={`relative rounded-lg px-4 py-3 transition-all duration-150
        border overflow-hidden flex items-center gap-3 cursor-pointer
        ${
          isSelected
            ? "bg-[#2a2a2a] border-[rgba(255,226,47,0.3)]"
            : "bg-secondary border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#333]"
        }`}
    >
      {/* Yellow accent stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-all duration-150 ${
          isSelected ? "bg-[#ffe22f]" : "bg-transparent"
        }`}
      />

      <CompanyLogo
        name={job.company.name}
        applicationUrl={job.application_url}
        logo={job.company.logo}
        className="h-8 w-8 rounded-md flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {job.title}
        </div>
        <div className="text-xs text-gray-400 truncate">
          <span className="text-[#ffe22f]">{job.company.name}</span>
          {job.locations && job.locations.length > 0 && (
            <span>
              {" "}
              ·{" "}
              {job.locations
                .slice(0, 2)
                .map((loc) => formatCapString(loc))
                .join(", ")}
            </span>
          )}
          {job.type && <span> · {formatCapString(job.type)}</span>}
        </div>
      </div>

      <div className="text-right flex-shrink-0 flex items-center gap-2">
        <span className="text-[11px] text-gray-500">
          {getTimeAgo(job.created_at)}
        </span>
        <IconChevronRight size={16} className="text-gray-600" />
      </div>
    </div>
  );
}
