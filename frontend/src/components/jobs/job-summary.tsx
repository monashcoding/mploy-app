// frontend/src/components/jobs/details/sections/job-description.tsx
import SectionHeading from "@/components/ui/section-heading";
import { IconRobot } from "@tabler/icons-react";

interface JobSummaryProps {
  one_liner?: string;
}

export default function JobSummary({ one_liner }: JobSummaryProps) {
  return (
    <div className="flex flex-col mt-4">
      <SectionHeading
        icon={<IconRobot size={16} stroke={1.5} />}
        title="Summary"
      />
      <span className={"prose prose-invert lg:ml-6 leading-relaxed text-xs"}>
        {one_liner}
      </span>
    </div>
  );
}
