"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconExternalLink } from "@tabler/icons-react";

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
      <Link
        href="https://monashcoding.com"
        target="_blank"
        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-selected transition-colors text-gray-300 hover:text-white"
      >
        MAC
        <IconExternalLink size={14} />
      </Link>
    </>
  );
}
