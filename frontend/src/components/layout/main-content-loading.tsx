// frontend/src/app/jobs/loading.tsx
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function MainContentLoading() {
  {
    /* Main content area */
  }
  return (
    <div className="mt-4 flex flex-col lg:flex-row">
      <div className="lg:pr-1 w-full lg:w-[35%]">
        <JobListLoading />
      </div>
      <div className="hidden lg:block lg:w-[65%] overflow-y-auto h-[calc(100vh-200px)]">
        <JobDetailsLoading />
      </div>
    </div>
  );
}
