// frontend/src/components/ui/first-visit-notification.tsx
"use client";

import { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

const FIRST_VISIT_KEY = "mploy_has_visited";

export default function FirstVisitNotification() {
  useEffect(() => {
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);

    if (!hasVisited) {
      localStorage.setItem(FIRST_VISIT_KEY, "true");

      showNotification({
        title: "Welcome!",
        position: "top-right",
        message:
          "We're in beta! You can submit feedback using the chat button on the bottom right.",
        color: "accent",
        autoClose: 8000,
      });
    }
  }, []);

  return null;
}
