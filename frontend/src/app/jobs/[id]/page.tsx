// src/app/jobs/[id]/page.tsx

import { getJobById } from "@/app/jobs/actions";
import { FilterProvider } from "@/context/filter/filter-provider";
import { notFound } from "next/navigation";
import { Job } from "@/types/job";
import JobDetailsWrapper from "@/components/jobs/job-details-wrapper";

export const metadata = {
  title: "Job Details",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job: Job | null = await getJobById(id);

  if (!job) {
    return notFound();
  }

  return (
    <FilterProvider>
      <div className="h-screen max-w-4xl mx-auto overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto mb-20 pb-12 mt-2">
          <JobDetailsWrapper job={job} />
        </div>
      </div>
    </FilterProvider>
  );
}
