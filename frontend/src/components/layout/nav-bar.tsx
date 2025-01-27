"use client";

import Logo from "@/components/layout/logo";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function NavBar() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <nav className="py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center min-h-14">
        <Logo />

        <div className="flex items-center gap-4">
          <Link className={"text-lg"} href="/">
            Home
          </Link>
          <Link className={"text-lg font-bold underline-fancy"} href="/jobs">
            Jobs
          </Link>
          <ActionIcon
            onClick={() =>
              setColorScheme(colorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            className="rounded-lg"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === "light" ? (
              <IconMoon size={15} />
            ) : (
              <IconSun size={15} />
            )}
          </ActionIcon>
        </div>
      </div>
    </nav>
  );
}
