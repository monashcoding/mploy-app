// src/app/jobs/[id]/page.tsx
import { getJobById } from "@/app/jobs/actions";
import JobDetails from "@/components/jobs/job-details";
import { FilterProvider } from "@/context/filter/filter-provider";
import { useFilterContext } from "@/context/filter/filter-context";
import { notFound } from "next/navigation";
import { Job } from "@/types/job";
import { useEffect } from "react";

export const metadata = {
  title: "Job Details",
};

interface JobDetailsWrapperProps {
  job: Job;
}

function JobDetailsWrapper({ job }: JobDetailsWrapperProps) {
  const { setSelectedJob } = useFilterContext();

  useEffect(() => {
    // Set the fetched job as the selected job in the context
    setSelectedJob(job);
  }, [job, setSelectedJob]);

  return <JobDetails />;
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch the job using its ID from the URL params
  const job = await getJobById(params.id);

  // If the job is not found, display a 404 page
  if (!job) {
    return notFound();
  }

  // Provide the job as initial state to the filter context,
  // then render the JobDetails component.
  return (
    <FilterProvider>
      <div className="p-4">
        <JobDetailsWrapper job={job} />
      </div>
    </FilterProvider>
      
  );
}
