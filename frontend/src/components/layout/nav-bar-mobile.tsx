"use client";
import Link from "next/link";
import { Button, Menu } from "@mantine/core";
import { IconMenu2, IconSearch } from "@tabler/icons-react";
import Logo from "@/components/layout/logo";
import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const NavBarMobile = () => {
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "https://monashcoding.com", label: "MAC ↗", external: true },
  ];

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
                {menuItems.map((item) => (
                  <Menu.Item
                    key={item.href}
                    component={Link}
                    href={item.href}
                    target={"external" in item ? "_blank" : undefined}
                    className={pathname === item.href ? "font-bold" : ""}
                  >
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>
        </>
      )}
    </>
  );
};
