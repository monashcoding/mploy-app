// frontend/src/components/ui/feedback-button.tsx
"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { submitFeedback } from "@/app/actions";

export default function FeedbackButton() {
  const [opened, setOpened] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !message ||
      !message.trim() ||
      message.trim().length < 3 ||
      message.length > 1000
    ) {
      notifications.show({
        position: "top-center",
        autoClose: 1500,
        withCloseButton: false,
        color: "red",
        message: "Feedback must be between 3 and 1k characters!",
      });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notifications.show({
        position: "top-center",
        autoClose: 1500,
        withCloseButton: false,
        color: "red",
        message: "Please enter a valid email address!",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      // Call our server action with the form data
      const result = await submitFeedback({ email, message });

      if (result.success) {
        // Clear form and close modal
        setEmail("");
        setMessage("");
        setOpened(false);

        notifications.show({
          position: "top-center",
          autoClose: 1500,
          withCloseButton: false,
          title: "Thank you!",
          message: "Your feedback has been submitted.",
          color: "green",
        });
      } else {
        notifications.show({
          position: "top-center",
          title: "Error",
          message:
            result.message || "Failed to submit feedback. Please try again.",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to submit feedback: " + error,
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ActionIcon
        className="fixed bottom-4 right-6 z-50"
        radius="xl"
        color="accent"
        size={50}
        c="black"
        onClick={() => setOpened(true)}
      >
        <IconMessageCircle size={20} />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Share Your Feedback"
        size="md"
        radius="lg"
        classNames={{
          content: "mt-12",
        }}
        padding="md"
      >
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email (optional)"
            placeholder="your@email.com"
            className="mb-4"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            type="email"
          />

          <Textarea
            label="Feedback"
            placeholder="Tell us about any bugs, features, missing listings or anything you want to say!"
            minRows={6}
            maxRows={15}
            className="mb-6"
            required
            autosize
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="accent"
              c="black"
              loading={isSubmitting}
            >
              Submit Feedback
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
