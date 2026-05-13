"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Stack, Text, Textarea } from "@mantine/core";

type Props = {
  opened: boolean;
  onClose: () => void;
  initialNotes?: string;
  appTitle: string;
  appCompany: string;
  onSave: (notes: string) => Promise<void>;
};

export default function NotesModal({
  opened,
  onClose,
  initialNotes,
  appTitle,
  appCompany,
  onSave,
}: Props) {
  const [value, setValue] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) setValue(initialNotes ?? "");
  }, [opened, initialNotes]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(value);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Text fw={700} size="sm">
            Notes
          </Text>
          <Text size="xs" c="dimmed">
            {appTitle} &middot; {appCompany}
          </Text>
        </Stack>
      }
      size="lg"
      styles={{
        content: {
          backgroundColor: "#2e2e2e",
          border: "2px solid #3a3a3a",
          borderRadius: "1rem",
        },
        header: { backgroundColor: "#2e2e2e" },
        overlay: { backdropFilter: "blur(2px)" },
      }}
    >
      <Stack gap="sm">
        <Textarea
          autosize
          minRows={6}
          maxRows={16}
          placeholder="Interview prep, recruiter contacts, salary range, follow-ups..."
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          styles={{
            input: {
              backgroundColor: "#3a3a3a",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              fontFamily: "inherit",
            },
          }}
        />
        <Button
          fullWidth
          loading={saving}
          onClick={handleSave}
          style={{
            backgroundColor: "#ffe22f",
            color: "#1f1f1f",
            borderRadius: "0.75rem",
            fontWeight: 700,
          }}
        >
          Save notes
        </Button>
      </Stack>
    </Modal>
  );
}
