// frontend/src/app/jobs/page.tsx
import { Title } from "@mantine/core";
import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/app/jobs/actions";
import JobPagination from "@/components/jobs/job-pagination";
import { Suspense } from "react";
import Loading from "@/app/loading";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  const { jobs, total } = await getJobs(await searchParams);

  return (
    <div className="space-y-4">
      <Title>
        <span className="font-light">Find</span>{" "}
        <span className="underline-fancy">Internships</span>{" "}
        <span className="font-light">and</span>{" "}
        <span className="underline-fancy">Student Jobs</span>
      </Title>
      <SearchBar />
      <FilterSection />

      <Suspense fallback={<Loading />}>
        <div className="mt-4 flex flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-[35%]">
            <div className="overflow-y-auto pr-2 no-scrollbar h-[calc(100vh-380px)]">
              <JobList jobs={jobs} />
            </div>
            <JobPagination totalJobs={total} />
          </div>

          <div className="hidden lg:block lg:w-[65%]">
            <div className="overflow-y-auto h-[calc(100vh-330px)]">
              <JobDetails />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
