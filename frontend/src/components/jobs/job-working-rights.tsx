// frontend/src/components/jobs/details/sections/job-working-rights.tsx
import SectionHeading from "@/components/ui/section-heading";
import Badge from "@/components/ui/badge";
import { formatCapString } from "@/lib/utils";
import { WorkingRight } from "@/types/job";

interface JobWorkingRightsProps {
  rights: WorkingRight[];
}

export default function JobWorkingRights({ rights }: JobWorkingRightsProps) {
  return (
    <div className="flex flex-col space-y-1 mt-2">
      <SectionHeading title="Working Rights" />
      <div className="space-x-2">
        {rights?.map((right) => (
          <Badge key={right} text={formatCapString(right)} size="lg" />
        ))}
      </div>
    </div>
  );
}
