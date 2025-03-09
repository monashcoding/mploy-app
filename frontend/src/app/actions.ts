// frontend/src/app/actions/feedback.ts
"use server";

// Type for our form data
export interface FeedbackFormData {
  email?: string;
  message: string;
}

export async function submitFeedback(data: FeedbackFormData) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID environment variable is not set");
  }

  if (!notionApiKey) {
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
      return {
        success: false,
        message: `Notion returned an API error: ${errorData.message || response.statusText}`,
      };
    }

    return { success: true, message: "Feedback submitted successfully." };
  } catch (error) {
    return {
      success: false,
      message: `Encountered an internal error: ${error}`,
    };
  }
}
