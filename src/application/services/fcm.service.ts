import { fcm } from "../../config/firebase.config.js";
import admin from "firebase-admin";

interface SendFCMOptions {
  tokens: string[]; // renamed for clarity
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendFCMNotification({ tokens, title, body, data }: SendFCMOptions): Promise<admin.messaging.BatchResponse | null> {
  if (!tokens || tokens.length === 0) {
    console.warn("⚠️ No FCM tokens provided, skipping notification.");
    return null;
  }

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens, // for multicast
    };

    const response = await fcm.sendEachForMulticast(message);
    console.log(`✅ FCM notifications sent: ${response.successCount} success, ${response.failureCount} failed`);

    if (response.failureCount > 0) {
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          console.error(`❌ Failed for token[${tokens[idx]}]:`, res.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error("❌ Error sending FCM notification:", error);
    throw error;
  }
}
