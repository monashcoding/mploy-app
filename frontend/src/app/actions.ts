// frontend/src/app/actions/feedback.ts
"use server";

import logger from "@/lib/logger";

// Type for our form data
export interface FeedbackFormData {
  email?: string;
  message: string;
}

export async function submitFeedback(data: FeedbackFormData) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!databaseId) {
    logger.error("NOTION_DATABASE_ID environment variable is not set");
    throw new Error("NOTION_DATABASE_ID environment variable is not set");
  }

  if (!notionApiKey) {
    logger.error("NOTION_API_KEY environment variable is not set");
    throw new Error("NOTION_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId,
        },
        properties: {
          Email: {
            title: [
              {
                text: {
                  content: data.email || "Anonymous",
                },
              },
            ],
          },
          Feedback: {
            rich_text: [
              {
                text: {
                  content: data.message,
                },
              },
            ],
          },
          Date: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error(
        { error: errorData, status: response.status },
        "Notion API error during feedback submission",
      );
      return {
        success: false,
        message: `We're sorry, but there was an issue submitting your feedback. Please try again later.`,
      };
    }

    logger.info(
      { email: data.email || "Anonymous" },
      "Feedback submitted successfully",
    );
    return {
      success: true,
      message: "Thank you! Your feedback has been submitted successfully.",
    };
  } catch (error) {
    logger.error(error, "Unexpected error during feedback submission");
    return {
      success: false,
      message: `An unexpected error occurred while submitting your feedback. Please try again.`,
    };
  }
}
