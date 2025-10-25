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

  // Filter out invalid tokens (Expo tokens, mock tokens, etc.)
  const validTokens = tokens.filter(token => {
    // Skip Expo push tokens
    if (token.startsWith('ExponentPushToken[')) {
      console.warn(`⚠️ Skipping Expo push token: ${token}`);
      return false;
    }
    // Skip mock tokens
    if (token.includes('mock-fcm-token')) {
      console.warn(`⚠️ Skipping mock FCM token: ${token}`);
      return false;
    }
    // Skip empty or invalid tokens
    if (!token || token.length < 10) {
      console.warn(`⚠️ Skipping invalid token: ${token}`);
      return false;
    }
    return true;
  });

  if (validTokens.length === 0) {
    console.warn("⚠️ No valid FCM tokens found after filtering, skipping notification.");
    return null;
  }

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens: validTokens, // for multicast
    };

    const response = await fcm.sendEachForMulticast(message);
    console.log(`✅ FCM notifications sent: ${response.successCount} success, ${response.failureCount} failed`);

    if (response.failureCount > 0) {
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          console.error(`❌ Failed for token[${validTokens[idx]}]:`, res.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error("❌ Error sending FCM notification:", error);
    throw error;
  }
}
