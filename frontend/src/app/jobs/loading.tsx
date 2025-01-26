// frontend/src/app/jobs/loading.tsx
export default function JobLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="h-8 w-96 bg-secondary/50 rounded-lg animate-pulse" />

      {/* Search bar skeleton */}
      <div className="h-14 w-full bg-secondary/50 rounded-xl animate-pulse" />

      {/* Filter section skeleton */}
      <div className="flex justify-between items-center my-4">
        <div className="h-6 w-24 bg-secondary/50 rounded animate-pulse" />
        <div className="h-6 w-32 bg-secondary/50 rounded animate-pulse" />
      </div>

      {/* Job list and details skeleton */}
      <div className="mt-4 flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-[35%]">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[155px] rounded-xl bg-secondary/50 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:w-[65%]">
          <div className="h-[calc(100vh-330px)] bg-secondary/50 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
