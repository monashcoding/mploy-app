// frontend/src/app/jobs/loading.tsx
import MainContentLoading from "@/components/layout/main-content-loading";

export default function Loading() {
  return (
    <div>
      {/* Filter bar placeholder */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-16 h-5 bg-secondary animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-secondary animate-pulse rounded-full" />
          <div className="w-20 h-7 bg-secondary animate-pulse rounded-full" />
          <div className="w-16 h-7 bg-secondary animate-pulse rounded-full" />
          <div className="w-20 h-7 bg-secondary animate-pulse rounded-full" />
        </div>
      </div>
      <MainContentLoading />
    </div>
  );
}
