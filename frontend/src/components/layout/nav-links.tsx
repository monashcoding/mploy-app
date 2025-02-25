"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <Link
        className={`text-lg ${pathname === "/" ? "font-bold underline-fancy" : ""}`}
        href="/"
      >
        Home
      </Link>
      <Link
        className={`text-lg ${pathname === "/jobs" ? "font-bold underline-fancy" : ""}`}
        href="/jobs"
      >
        Jobs
      </Link>
    </>
  );
}
