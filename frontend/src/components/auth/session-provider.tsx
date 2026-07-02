"use client";

import { MacSessionProvider } from "@/lib/mac-session";
import { PropsWithChildren } from "react";

export default function AuthSessionProvider({ children }: PropsWithChildren) {
  return <MacSessionProvider>{children}</MacSessionProvider>;
}
