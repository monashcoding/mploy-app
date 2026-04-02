"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, Menu } from "@mantine/core";
import { IconUser, IconLogout, IconClipboardList } from "@tabler/icons-react";

export default function NavLinks() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const linkClass = (href: string) =>
    `text-lg ${pathname === href ? "font-bold underline-fancy" : ""}`;

  return (
    <>
      <Link className={linkClass("/")} href="/">
        Home
      </Link>
      <Link className={linkClass("/jobs")} href="/jobs">
        Jobs
      </Link>

      {status === "authenticated" ? (
        <Menu position="bottom-end" offset={8} width={180}>
          <Menu.Target>
            <Avatar
              src={session.user?.image ?? undefined}
              alt={session.user?.name ?? "Profile"}
              color="accent"
              radius="xl"
              size="sm"
              className="cursor-pointer"
            >
              {session.user?.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : <IconUser size={16} />}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{session.user?.email}</Menu.Label>
            <Menu.Item
              component={Link}
              href="/my-applications"
              leftSection={<IconClipboardList size={16} />}
            >
              My Applications
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Link className={linkClass("/sign-in")} href="/sign-in">
          Sign in
        </Link>
      )}
    </>
  );
}
