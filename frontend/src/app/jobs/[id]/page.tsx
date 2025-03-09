// src/app/jobs/[id]/page.tsx

import { getJobById } from "@/app/jobs/actions";
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
    <div className="h-screen max-w-4xl mx-auto overflow-hidden flex flex-col">
      <div className="overflow-y-auto h-[calc(100svh-120px)] lg:h-[calc(100svh-180px)]">
        <JobDetailsWrapper job={job} />
      </div>
    </div>
  );
}
