import { ScrollArea } from "@mantine/core";

export default function JobListLoading() {
  return (
    <ScrollArea
      className="h-[calc(100svh-160px)] lg:h-[calc(100svh-200px)]"
      type="never"
      offsetScrollbars
    >
      <div className="space-y-3 pr-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-secondary p-4 animate-pulse"
          >
            <div className="flex gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#1f1f1f]" />
              <div className="flex-1">
                <div className="h-4 bg-[#1f1f1f] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#1f1f1f] rounded w-1/3" />
              </div>
            </div>
            <div className="h-3 bg-[#1f1f1f] rounded w-full mb-1.5" />
            <div className="h-3 bg-[#1f1f1f] rounded w-2/3 mb-3" />
            <div className="flex gap-1.5">
              <div className="h-5 bg-[#1f1f1f] rounded-md w-14" />
              <div className="h-5 bg-[#1f1f1f] rounded-md w-20" />
              <div className="h-5 bg-[#1f1f1f] rounded-md w-16" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
