// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs, getSponsoredJobs } from "@/app/jobs/actions";
import NoResults from "@/components/ui/no-results";
import { Suspense } from "react";
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";
import { getSponsoredSlots } from "@/lib/utils";

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

  const filters = await searchParams;

  // Fetch regular jobs with pagination.
  const { jobs, total } = await getJobs(filters);

  // Fetch all sponsored jobs (non-paginated) that match the filter.
  const { jobs: sponsoredJobs } = await getSponsoredJobs(filters);

  // Hardcode the platinum sponsor companies.
  const platinumSponsors = ["IMC", "Atlassian"];

  // Use our helper to get a set of sponsored slots.
  const sponsoredSlots = getSponsoredSlots(sponsoredJobs, platinumSponsors, 4);

  // Remove any duplicate jobs from the regular list that appear in the sponsored slots.
  const sponsoredJobIds = new Set(sponsoredSlots.map((job) => job.id));
  const jobsWithoutDuplicates = jobs.filter(
    (job) => !sponsoredJobIds.has(job.id),
  );

  return (
    <>
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        <NoResults />
      ) : (
        <div className="mt-4 flex flex-col lg:flex-row">
          <div id="job-list-container" className="lg:pr-1 w-full lg:w-[35%]">
            <Suspense fallback={<JobListLoading />}>
              <JobList
                jobs={jobsWithoutDuplicates}
                sponsoredJobs={sponsoredSlots}
              />
            </Suspense>
          </div>

          <div className="hidden lg:block lg:w-[65%] overflow-y-auto h-[calc(100svh-140px)] lg:h-[calc(100svh-180px)]">
            <Suspense fallback={<JobDetailsLoading />}>
              <JobDetails />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
