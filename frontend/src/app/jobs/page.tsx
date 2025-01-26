import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/app/jobs/actions";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  // searchParams is a promise that resolves to an object containing the search
  // parameters of the current URL.
  const jobs = await getJobs(await searchParams);

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

      <div className="mt-4 flex flex-col lg:flex-row gap-2 h-[calc(100vh-330px)] ">
        <div className="w-full lg:w-[35%] overflow-y-auto pr-2 no-scrollbar">
          <JobList />
        </div>

        <div className="hidden lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-330px)]">
            <JobDetails job={jobs[0]} />
          </div>
        </div>
      </div>
    </div>
  );
}
