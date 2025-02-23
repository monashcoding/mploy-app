"use client"

import { IconMenu2, IconSearch } from "@tabler/icons-react";
import { Button, Menu } from "@mantine/core"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, ReactNode } from "react";
import SearchBar from "@/components/search/search-bar";

// Client component for mobile search with toggle
export function MobileSearch({ children }: { children: ReactNode }) {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  if (showSearch) {
    return (
      <div className="w-full flex items-center gap-4">
        <Button
          variant="subtle"
          onClick={toggleSearch}
          className="flex-shrink-0"
        >
          ←
        </Button>
        <SearchBar />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-between items-center">
      {children}
      <MobileControls onSearchToggle={toggleSearch} />
    </div>
  );
}

// Client component for mobile controls
function MobileControls({ onSearchToggle }: { onSearchToggle: () => void }) {
  const pathname = usePathname();
  
  return (
    <div className="flex items-center gap-4 lg:hidden">
      <Button variant="subtle" onClick={onSearchToggle} className="p-0">
        <IconSearch size={20} />
      </Button>
      <Menu position="bottom-end" offset={8} width={150}>
        <Menu.Target>
          <Button variant="subtle" className="p-0">
            <IconMenu2 size={20} />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            component={Link}
            href="/"
            className={pathname === "/" ? "font-bold" : ""}
          >
            Home
          </Menu.Item>
          <Menu.Item
            component={Link}
            href="/jobs"
            className={pathname === "/jobs" ? "font-bold" : ""}
          >
            Jobs
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}

// Client component for navigation links
export function NavLinks() {
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