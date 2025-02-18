// frontend/src/components/layout/nav-bar.tsx
"use client";

import Logo from "@/components/layout/logo";
import Link from "next/link";
import SearchBar from "@/components/search/search-bar";
import { Button, Menu } from "@mantine/core";
import { IconSearch, IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";

export default function NavBar() {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const NavLinks = () => (
    <>
      <Link className="text-lg" href="/">
        Home
      </Link>
      <Link className="text-lg font-bold underline-fancy" href="/jobs">
        Jobs
      </Link>
    </>
  );

  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        {showSearch ? (
          <div className="w-full flex items-center gap-4 lg:hidden">
            <Button
              variant="subtle"
              onClick={toggleSearch}
              className="flex-shrink-0"
            >
              ←
            </Button>
            <SearchBar />
          </div>
        ) : (
          <>
            <Logo />
            <div className="hidden lg:block w-full mx-52">
              <SearchBar />
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <NavLinks />
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-4 lg:hidden">
              <Button variant="subtle" onClick={toggleSearch} className="p-0">
                <IconSearch size={20} />
              </Button>
              <Menu position="bottom-end" offset={8} width={150}>
                <Menu.Target>
                  <Button variant="subtle" className="p-0">
                    <IconMenu2 size={20} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item component={Link} href="/">
                    Home
                  </Menu.Item>
                  <Menu.Item component={Link} href="/jobs">
                    Jobs
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
