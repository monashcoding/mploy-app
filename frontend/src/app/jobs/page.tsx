// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobsContent from "@/components/jobs/jobs-content";
import { JobFilters } from "@/types/filters";
import { getJobs } from "@/actions/jobs.fetch";
import NoResults from "@/components/ui/no-results";

export const metadata = {
  title: "Jobs",
};

export const revalidate = 3600; // 1 hour cache

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  const filters = await searchParams;
  const { jobs, total } = await getJobs(filters);

  return (
    <>
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        <NoResults />
      ) : (
        <div className="mt-4">
          <JobsContent jobs={jobs} />
        </div>
      )}
    </>
  );
}
