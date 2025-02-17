// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/app/jobs/actions";
import NoResults from "@/components/ui/no-results";
import JobPagination from "@/components/jobs/job-pagination";
import { Suspense } from "react";
import Loading from "@/app/jobs/loading";

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
    <div className="">
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        <NoResults />
      ) : (
        <Suspense fallback={<Loading />}>
          <div className="mt-4 flex flex-col lg:flex-row gap-2">
            <div className="w-full lg:w-[35%]">
              <div className="overflow-y-auto pr-2 h-[calc(100vh-220px)]">
                <JobList jobs={jobs} />
                <JobPagination />
              </div>
            </div>

            <div className="hidden lg:block lg:w-[65%]">
              <div className="overflow-y-auto h-[calc(100vh-220px)]">
                <JobDetails />
              </div>
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
}
