import { Text } from "@mantine/core";

interface InfoTagProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export const InfoTag = ({ icon, text, className }: InfoTagProps) => (
  <div
    className={`inline-flex items-center gap-1 bg-selected py-1 px-2 rounded-lg ${className}`}
  >
    {icon}
    <Text size="sm" className="whitespace-normal">
      {text}
    </Text>
  </div>
);
