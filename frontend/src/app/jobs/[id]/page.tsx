// src/app/jobs/[id]/page.tsx

import { getJobById } from "@/app/jobs/actions";
import { notFound } from "next/navigation";
import { Job } from "@/types/job";
import JobDetailsWrapper from "@/components/jobs/job-details-wrapper";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the job
  const { id } = await params;
  const job: Job | null = await getJobById(id);

  // Fallback to parent metadata if job not found
  if (!job) {
    return {
      title: "Job Not Found",
      description: "The requested job could not be found.",
    };
  }

  // Create dynamic title and description
  const title = `${job.title} at ${job.company.name}`;
  const description =
    job.one_liner || `${job.title} position at ${job.company.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/OgImage.png",
          alt: title,
        },
      ],
    },
  };
}

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
