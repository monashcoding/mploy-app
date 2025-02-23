// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/app/jobs/actions";
import NoResults from "@/components/ui/no-results";
import JobPagination from "@/components/jobs/job-pagination";
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";
import { Suspense } from "react";
export const metadata = {
  title: "Find Jobs",
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
      {/* Filter section (client component)*/}
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        // No results found (client component)
        <NoResults />
      ) : (
        <div className="mt-4 flex flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-[35%]">
            <div
              id="job-list-container"
              className="overflow-y-auto pr-2 h-[calc(100vh-220px)]"
            >
              {/* Job list (client component) */}
              <Suspense fallback={<JobListLoading />}>
                <JobList jobs={jobs} />
              </Suspense>

              {/* Job pagination (client component) */}
              <JobPagination />
            </div>
          </div>

          <div className="hidden lg:block lg:w-[65%]">
            <div className="overflow-y-auto h-[calc(100vh-220px)]">
              {/* Job details (client component) */}
              <Suspense fallback={<JobDetailsLoading />}>
                <JobDetails />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
