import MacLogo from "@/assets/mac.svg";
import Image from "next/image";
import Link from "next/link";
import {Suspense} from "react";

export default function Logo() {
  return (
    <Link href="/">
      <div className="flex space-x-3 items-center h-8 cursor-pointer">
        <Suspense fallback={<div>Loading...</div>}>
          <Image src={MacLogo} className={"h-12 w-12"} alt="MAC Logo" />
        </Suspense>
        <span className="text-xl">Jobs</span>
      </div>
    </Link>
  );
}
