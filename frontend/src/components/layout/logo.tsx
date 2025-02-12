import MacLogo from "@/assets/mac.svg";
import Image from "next/image";
export default function Logo() {
  return (
    <div
      className="flex space-x-3 items-center h-8 cursor-pointer"
      onClick={() => (window.location.href = "/")}
    >
      <Image src={MacLogo} className={"h-12 w-12"} alt="MAC Logo" />
      <span className="text-xl text-nowrap">Jobs</span>
    </div>
  );
}
