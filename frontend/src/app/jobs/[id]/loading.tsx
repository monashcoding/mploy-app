// frontend/src/app/jobs/[id]/loading.tsx
import JobDetailsLoading from "@/components/layout/job-details-loading";

export default function JobIdLoading() {
  return (
    <div className="h-screen max-w-4xl mx-auto overflow-hidden flex flex-col">
      <div className="flex-grow overflow-y-auto mb-20 pb-12 mt-2">
        <JobDetailsLoading />
      </div>
    </div>
  );
}
