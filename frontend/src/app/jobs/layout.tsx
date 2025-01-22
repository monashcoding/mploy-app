import { JobsProvider } from "@/context/jobs/jobs-provider";
import { PropsWithChildren } from "react";

export default function JobsLayout({ children }: PropsWithChildren) {
  return (
    <JobsProvider>
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </JobsProvider>
  );
}
