import Logo from "@/components/layout/logo";
import {Button} from "@mantine/core";

export default function NavBar() {
  return (
    <nav className="p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex gap-4">
          <Button variant="transparent">Home</Button>
          <Button variant="transparent">Jobs</Button>
        </div>
      </div>
    </nav>
  );
}
