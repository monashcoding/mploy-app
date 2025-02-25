import MacLogo from "@/assets/mac.svg";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Logo() {
  return (
    <Link href="/" className="flex space-x-3 items-center h-8 cursor-pointer">
      <div className="h-12 w-12 relative">
        <Suspense
          fallback={
            <div className="h-12 w-12 bg-gray-600 rounded-md animate-pulse" />
          }
        >
          <Image src={MacLogo} className={"h-12 w-12"} alt="MAC Logo" />
        </Suspense>
      </div>
      <span className="text-xl">Jobs</span>
    </Link>
  );
}
