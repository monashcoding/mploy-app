import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex space-x-3 items-center h-8 cursor-pointer">
      <Image
        src="/mac.svg"
        width={40}
        height={40}
        className="h-10 w-10"
        alt="MAC Logo"
      />
      <span className="text-lg lg:text-xl">Jobs</span>
    </Link>
  );
}
