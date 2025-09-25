// frontend/src/components/layout/job-details-loading.tsx
import { Card, ScrollArea } from "@mantine/core";

export default function JobDetailsLoading() {
  return (
    <Card bd="2px solid selected" className="h-full rounded-xl flex flex-col">
      <ScrollArea offsetScrollbars type="hover" className="flex-grow">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex justify-between w-full pr-4 mb-6">
            <div className="w-3/4">
              <div className="h-7 bg-secondary rounded mb-2 w-4/5" />
              <div className="h-4 bg-secondary rounded mb-4 w-1/2" />
            </div>
            <div className="h-16 w-16 bg-secondary rounded-md" />
          </div>

          {/* Description section skeleton */}
          <div className="flex flex-col mt-4">
            <div className="flex items-center mb-2">
              <div className="h-5 w-5 bg-secondary rounded-full" />
              <div className="h-6 bg-secondary rounded ml-2 w-28" />
            </div>
            <div className="space-y-2 lg:ml-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 bg-secondary rounded ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-2/3"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action buttons skeleton */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <div className="h-10 bg-secondary rounded flex-grow" />
        <div className="h-10 w-36 bg-secondary rounded hidden lg:block" />
        <div className="h-10 w-10 bg-secondary rounded lg:hidden" />
      </div>
    </Card>
  );
}
