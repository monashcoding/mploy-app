"use client";

import Logo from "@/components/layout/logo";
import { Button, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";

export default function NavBar() {
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();

  return (
    <nav className="p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />

        <div className="flex">
          <Link href="/">
            <Button variant="transparent" size="lg">
              <span className="text-text font-light">Home</span>
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="transparent" size="lg">
              <span className="text-text underline-fancy">
                Current Openings
              </span>
            </Button>
          </Link>
          <Button onClick={() => setColorScheme("light")}>Light</Button>
          <Button onClick={() => setColorScheme("dark")}>Dark</Button>
        </div>
      </div>
    </nav>
  );
}
