import { ScrollArea } from "@mantine/core";

export default function JobListLoading() {
  return (
    <ScrollArea
      className="h-[calc(100svh-140px)] lg:h-[calc(100svh-180px)]"
      type="never"
      offsetScrollbars
    >
      <div className="space-y-4 pr-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-[10rem] animate-pulse bg-secondary rounded-xl p-4"
          />
        ))}
      </div>
    </ScrollArea>
  );
}
