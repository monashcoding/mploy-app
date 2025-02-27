// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/app/jobs/actions";
import NoResults from "@/components/ui/no-results";
import { Suspense } from "react";
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export const metadata = {
  title: "Jobs",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  // searchParams is a promise that resolves to an object containing the search
  // parameters of the current URL.

  const { jobs, total } = await getJobs(await searchParams);

  return (
    <>
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        <NoResults />
      ) : (
        <div className="mt-4 flex flex-col lg:flex-row">
          <div id="job-list-container" className="lg:pr-1 w-full lg:w-[35%]">
            <Suspense fallback={<JobListLoading />}>
              <JobList jobs={jobs} />
            </Suspense>
          </div>

          <div className="hidden lg:block lg:w-[65%] overflow-y-auto h-[calc(100vh-200px)]">
            <Suspense fallback={<JobDetailsLoading />}>
              <JobDetails />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
