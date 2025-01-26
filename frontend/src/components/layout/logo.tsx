import { Text, Divider } from "@mantine/core";
import MacLogo from "@/assets/mac.svg";
import Image from "next/image";
export default function Logo() {
  return (
    <div className="flex space-x-3 items-center h-8">
      <Image priority src={MacLogo} alt="Follow us on Twitter" />
      <Divider size="xs" color="white" orientation="vertical" />
      <Text size="xl">
        <span className="font-light">JOB BOARD</span>
      </Text>
    </div>
  );
}
