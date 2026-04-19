// frontend/src/components/layout/job-details-loading.tsx
export default function JobDetailsLoading() {
  return (
    <div className="h-full flex flex-col rounded-xl border border-[rgba(255,255,255,0.06)] bg-secondary overflow-hidden">
      <div className="flex-grow p-5 lg:p-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="h-7 bg-[#1f1f1f] rounded w-4/5 mb-2" />
            <div className="h-4 bg-[#1f1f1f] rounded w-1/3 mb-4" />
            <div className="flex gap-2 flex-wrap">
              <div className="h-8 bg-[#1f1f1f] rounded-lg w-24" />
              <div className="h-8 bg-[#1f1f1f] rounded-lg w-28" />
              <div className="h-8 bg-[#1f1f1f] rounded-lg w-20" />
            </div>
          </div>
          <div className="h-14 w-14 bg-[#1f1f1f] rounded-xl flex-shrink-0" />
        </div>

        {/* Summary skeleton */}
        <div className="p-4 bg-[#1f1f1f] rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 bg-[#2a2a2a] rounded" />
            <div className="h-3 bg-[#2a2a2a] rounded w-20" />
          </div>
          <div className="h-4 bg-[#2a2a2a] rounded w-full mb-1.5" />
          <div className="h-4 bg-[#2a2a2a] rounded w-3/4" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 bg-[#1f1f1f] rounded" />
            <div className="h-3 bg-[#1f1f1f] rounded w-28" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-[#1f1f1f] rounded ${
                i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-2/3"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center gap-3 px-5 lg:px-6 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="h-10 bg-[#1f1f1f] rounded-md flex-grow" />
        <div className="h-10 w-28 bg-[#1f1f1f] rounded-md hidden lg:block" />
      </div>
    </div>
  );
}
