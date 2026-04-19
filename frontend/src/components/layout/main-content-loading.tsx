// frontend/src/components/layout/main-content-loading.tsx
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function MainContentLoading() {
  return (
    <div className="mt-4 flex flex-col lg:flex-row">
      <div className="lg:pr-3 w-full lg:w-[38%]">
        <JobListLoading />
      </div>
      <div className="hidden lg:block lg:w-[62%] overflow-y-auto h-[calc(100svh-200px)]">
        <JobDetailsLoading />
      </div>
    </div>
  );
}
