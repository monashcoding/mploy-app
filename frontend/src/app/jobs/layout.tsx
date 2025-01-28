import { FilterProvider } from "@/context/filter/filter-provider";
import { PropsWithChildren } from "react";

export default function JobsLayout({ children }: PropsWithChildren) {
  return (
    <FilterProvider>
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </FilterProvider>
  );
}
