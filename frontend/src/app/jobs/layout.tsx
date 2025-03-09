import { PropsWithChildren } from "react";

export default function JobsLayout({ children }: PropsWithChildren) {
  return <div className="max-w-7xl mx-auto">{children}</div>;
}
