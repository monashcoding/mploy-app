

import Link from "next/link";
import { Button, Menu } from "@mantine/core";
import { IconMenu2, IconSearch } from "@tabler/icons-react";
import Logo from "@/components/layout/logo";
import SearchBar from "@/components/search/search-bar";

export const NavBarMobile = ({
  showSearch,
  setShowSearch,
  pathname,
}: {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  pathname: string;
}) => {
  return (
    <>
      {showSearch ? (
        <div className="w-full flex items-center gap-4 lg:hidden">
          <Button
            variant="subtle"
            onClick={() => setShowSearch(false)}
            className="flex-shrink-0"
          >
            ←
          </Button>
          <SearchBar />
        </div>
      ) : (
        <>
          <div className={"lg:hidden"}>
            <Logo />
          </div>
          <div className="lg:hidden flex items-center gap-4">
            <Button
              variant="subtle"
              onClick={() => setShowSearch(true)}
              className="p-0"
            >
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
        </>
      )}
    </>
  );
};
