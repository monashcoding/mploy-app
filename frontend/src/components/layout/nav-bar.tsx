"use client";

import Logo from "@/components/layout/logo";
import Link from "next/link";
import SearchBar from "@/components/search/search-bar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavBarMobile } from "./nav-bar-mobile";

export default function NavBar() {
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
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

  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        {/* Mobile View */}
        <NavBarMobile
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          pathname={pathname}
        />

        {/* Desktop View */}
        <div className="hidden lg:flex w-full justify-between items-center">
          <Logo />
          <div className="w-full mx-52">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <NavLinks />
          </div>
        </div>
      </div>
    </nav>
  );
}
