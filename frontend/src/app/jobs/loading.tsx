// frontend/src/app/jobs/loading.tsx
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function Loading() {
  return (
    <div className="">
      {/* FilterSection placeholder - this should always be visible */}
      <div className="flex flex-row justify-between items-center">
        <div className="w-24 h-9 bg-secondary animate-pulse rounded" />
      </div>

      {/* Main content area */}
      <div className="mt-4 flex flex-col lg:flex-row gap-2">
        {/* Job list section */}
        <div className="w-full lg:w-[35%]">
          <div className="overflow-y-auto pr-2 h-[calc(100vh-220px)]">
            <JobListLoading />
          </div>
        </div>

        {/* Job details section */}
        <div className="hidden lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-220px)]">
            <JobDetailsLoading />
          </div>
        </div>
      </div>
    </div>
  );
}
