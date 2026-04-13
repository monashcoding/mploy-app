"use client";
import Link from "next/link";
import { Button, Menu } from "@mantine/core";
import {
  IconMenu2,
  IconSearch,
  IconLogout,
  IconClipboardList,
} from "@tabler/icons-react";
import Logo from "@/components/layout/logo";
import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export const NavBarMobile = () => {
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    ...(status === "authenticated"
      ? [{ href: "/my-applications", label: "Applications" }]
      : [{ href: "/sign-in", label: "Sign in" }]),
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
            <Menu position="bottom-end" offset={8}>
              <Menu.Target>
                <Button variant="subtle" className="p-0">
                  <IconMenu2 size={20} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {session?.user?.email && (
                  <Menu.Label>{session.user.email}</Menu.Label>
                )}
                {menuItems.map((item) => (
                  <Menu.Item
                    key={item.href}
                    component={Link}
                    href={item.href}
                    className={pathname === item.href ? "font-bold" : ""}
                    leftSection={
                      item.href === "/my-applications" ? (
                        <IconClipboardList size={16} />
                      ) : undefined
                    }
                  >
                    {item.label}
                  </Menu.Item>
                ))}
                {status === "authenticated" && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={16} />}
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        </>
      )}
    </>
  );
};
