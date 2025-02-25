import MacLogo from "@/assets/mac.svg";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex space-x-3 items-center h-8 cursor-pointer">
      <div className="h-12 w-12 relative">
        <Image
          src={MacLogo}
          className={"h-12 w-12"}
          alt="MAC Logo"
          placeholder="blur"
          blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8cEf3PwAHtwL6YluwEgAAAABJRU5ErkJggg=="
        />
      </div>
      <span className="text-xl">Jobs</span>
    </Link>
  );
}
