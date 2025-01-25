import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";
import { parseUrlFilters } from "@/lib/parse-url-filters";
import { ReadonlyURLSearchParams } from "next/navigation";
import { Job, JobFilters } from "@/types/job";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchJobs(filters: JobFilters): Promise<Job[]> {
  // TODO: Implement actual data fetching
  return [];
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams;
}) {
  const initialFilters = parseUrlFilters(searchParams);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const jobs = await fetchJobs(initialFilters);
  
  
  return (
    <div className="space-y-4">
      <Title>Find Internships and Student Jobs</Title>
      <SearchBar />
      <FilterSection />

      <div className="mt-4 flex flex-col lg:flex-row gap-2 h-[calc(100vh-330px)] ">
        <div className="w-full lg:w-[35%] overflow-y-auto pr-2 no-scrollbar">
          <JobList />
        </div>

        {/* Sticky Job Details - hidden on mobile, 70% on desktop */}
        <div className="hidden lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-330px)]">
            <JobDetails />
          </div>
        </div>
      </div>
    </div>
  );
}
