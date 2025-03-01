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
      <div className="flex items-center justify-center m0 p0">
        <div
          className="rounded-lg overflow-y-auto"
          style={{
            height: "calc(100vh - 120px)",
            width: "110%",
            maxWidth: "800px",
          }}
        >
          <JobDetailsWrapper job={job} />
        </div>
      </div>
    </FilterProvider>
  );
}
