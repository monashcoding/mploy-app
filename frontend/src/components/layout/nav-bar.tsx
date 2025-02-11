"use client";

import Logo from "@/components/layout/logo";
import Link from "next/link";
import SearchBar from "@/components/search/search-bar";

export default function NavBar() {
  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        <Logo />

        <SearchBar />

        <div className="flex items-center gap-4">
          <Link className={"text-lg"} href="/">
            Home
          </Link>
          <Link className={"text-lg font-bold underline-fancy"} href="/jobs">
            Jobs
          </Link>
        </div>
      </div>
    </nav>
  );
}
