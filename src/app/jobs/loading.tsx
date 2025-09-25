// frontend/src/app/jobs/loading.tsx
import MainContentLoading from "@/components/layout/main-content-loading";

export default function Loading() {
  return (
    <div>
      {/* FilterSection placeholder - this should always be visible */}
      <div className="flex flex-row justify-between items-center">
        <div className="w-24 h-9 bg-secondary animate-pulse rounded" />
        <div className="flex flex-row items-center">
          <div className="w-24 h-9 bg-secondary animate-pulse rounded-lg" />
        </div>
      </div>
      <MainContentLoading />
    </div>
  );
}
