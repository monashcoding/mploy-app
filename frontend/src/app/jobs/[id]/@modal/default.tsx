import { Modal, ScrollArea } from "@mantine/core";

export default function JobModal() {
  return (
    <Modal
      opened={true}
      onClose={() => {}}
      size="lg"
      title="Job Details"
      scrollAreaComponent={ScrollArea}
    ></Modal>
  );
}
