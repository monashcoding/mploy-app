// frontend/src/components/ui/first-visit-notification.tsx
"use client";

import { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

export default function FirstVisitNotification() {
    useEffect(() => {
        const hasVisited = localStorage.getItem("mploy_has_visited");

        if (!hasVisited) {
            localStorage.setItem("mploy_has_visited", "true");

            // Show notification
            showNotification({
                title: "Welcome!",
                position: "top-right",
                message: "We're in beta! You can submit feedback using the chat button on the bottom right.",
                color: "accent",
                autoClose: 8000,
            });
        }
    }, []);

    return null;
}