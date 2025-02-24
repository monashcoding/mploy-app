// src/app/jobs/[id]/page.tsx

import { getJobById } from "@/app/jobs/actions";
import { FilterProvider } from "@/context/filter/filter-provider";
import { notFound } from "next/navigation";
import { Job } from "@/types/job";
import JobDetailsWrapper from "@/components/jobs/job-details-wrapper";

export const metadata = {
  title: "Job Details",
};

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch the job using its ID from the URL parameters.
  const resolvedParams = await params;
  const job: Job | null = await getJobById(resolvedParams.id);

  if (!job) {
    return notFound();
  }

  return (
    <FilterProvider>
      <div className="h-screen overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto pl-12 pr-12 p-4 mb-20 pb-16">
          <JobDetailsWrapper job={job} />
        </div>
      </div>
    </FilterProvider>
  );
}
