// frontend/src/components/jobs/job-summary.tsx
import { IconRobot } from "@tabler/icons-react";

interface JobSummaryProps {
  one_liner?: string;
}

export default function JobSummary({ one_liner }: JobSummaryProps) {
  return (
    <div className="mt-6 p-4 bg-[#1f1f1f] rounded-lg border border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        <IconRobot size={16} stroke={1.5} className="text-[#ffe22f]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          AI Summary
        </span>
      </div>
      <span className="prose prose-invert leading-relaxed text-sm text-gray-300">
        {one_liner}
      </span>
    </div>
  );
}
