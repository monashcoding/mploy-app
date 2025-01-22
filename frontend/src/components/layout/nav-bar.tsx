import Logo from "@/components/layout/logo";
import { Button } from "@mantine/core";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="transparent">Home</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="transparent">Jobs</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
