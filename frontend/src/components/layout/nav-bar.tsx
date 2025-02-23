"use client";

import Logo from "@/components/layout/logo";
import Link from "next/link";
import SearchBar from "@/components/search/search-bar";
import { Button, Menu } from "@mantine/core";
import { IconMenu2, IconSearch } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
                        {/* Regular Mobile View */}
                        <div className={"lg:hidden"}>
                            <Logo />
                        </div>
                        <div className="lg:hidden flex items-center gap-4">
                            <Button variant="subtle" onClick={() => setShowSearch(true)} className="p-0">
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