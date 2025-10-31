import { fcm } from "../../config/firebase.config.js";
import admin from "firebase-admin";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";

interface SendFCMOptions {
  tokens: string[]; // renamed for clarity
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string; // Android notification channel ID (default: 'default', options: 'orders', 'restaurant', 'delivery', etc.)
  priority?: 'high' | 'normal'; // Notification priority (default: 'high')
}

// Initialize repositories for token cleanup
const userRepo = new UserRepository();
const restaurantAdminRepo = new RestaurantAdminRepository();
const martStoreAdminRepo = new MartStoreAdminRepository();

/**
 * Clean up invalid FCM token from all collections
 * @param tokenValue - The invalid FCM token to remove
 */
async function cleanupInvalidToken(tokenValue: string): Promise<void> {
  try {
    // Try to remove from all collections in parallel
    const [userRemoved, restaurantAdminRemoved, martStoreAdminRemoved] = await Promise.allSettled([
      userRepo.removeFCMToken(tokenValue),
      restaurantAdminRepo.removeFCMToken(tokenValue),
      martStoreAdminRepo.removeFCMToken(tokenValue)
    ]);

    let removed = false;
    if (userRemoved.status === 'fulfilled' && userRemoved.value) {
      console.log(`🧹 Cleaned up invalid FCM token from User: ${tokenValue.substring(0, 20)}...`);
      removed = true;
    }
    if (restaurantAdminRemoved.status === 'fulfilled' && restaurantAdminRemoved.value) {
      console.log(`🧹 Cleaned up invalid FCM token from RestaurantAdmin: ${tokenValue.substring(0, 20)}...`);
      removed = true;
    }
    if (martStoreAdminRemoved.status === 'fulfilled' && martStoreAdminRemoved.value) {
      console.log(`🧹 Cleaned up invalid FCM token from MartStoreAdmin: ${tokenValue.substring(0, 20)}...`);
      removed = true;
    }

    if (removed) {
      console.log(`✅ Successfully removed invalid FCM token from database`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning up invalid FCM token:`, error);
  }
}

/**
 * Check if error indicates an invalid/expired token that should be removed
 */
function isInvalidTokenError(error: any): boolean {
  if (!error || !error.code) return false;
  
  // List of error codes that indicate the token is invalid and should be removed
  const invalidTokenCodes = [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument' // Also handle invalid-argument which might indicate bad token format
  ];
  
  return invalidTokenCodes.includes(error.code);
}

export async function sendFCMNotification({ tokens, title, body, data, channelId = 'default', priority = 'high' }: SendFCMOptions): Promise<admin.messaging.BatchResponse | null> {
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
    // FCM tokens should be base64-like strings (typically 140+ characters)
    // But some valid tokens might be shorter, so we'll just check for basic format
    // Valid FCM tokens don't contain spaces or special characters that would break
    if (token.includes(' ') || token.includes('\n') || token.includes('\r')) {
      console.warn(`⚠️ Skipping token with invalid characters: ${token.substring(0, 20)}...`);
      return false;
    }
    return true;
  });

  if (validTokens.length === 0) {
    console.warn("⚠️ No valid FCM tokens found after filtering, skipping notification.");
    return null;
  }

  try {
    // Ensure all data values are strings (FCM requirement)
    const dataPayload: Record<string, string> = {};
    if (data) {
      Object.keys(data).forEach(key => {
        dataPayload[key] = String(data[key]);
      });
    }

    const message: admin.messaging.MulticastMessage = {
      notification: { 
        title, 
        body,
        // Don't set sound here - it's platform-specific
      },
      data: dataPayload,
      tokens: validTokens, // for multicast
      // Android specific: High priority for background delivery
      android: {
        priority: priority === 'high' ? 'high' as const : 'normal' as const,
        notification: {
          channelId: channelId, // Use specified channel (e.g., 'orders', 'restaurant', 'default')
          priority: priority === 'high' ? 'high' as const : 'default' as const,
          sound: 'default',
          visibility: 'public' as const,
        },
      },
      // iOS specific: High priority for background delivery
      apns: {
        headers: {
          'apns-priority': priority === 'high' ? '10' : '5', // 10 = high priority, 5 = normal
        },
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            sound: 'default',
            badge: 1,
            contentAvailable: true, // Enable background processing
          },
        },
      },
      // Web push specific
      webpush: {
        notification: {
          title,
          body,
          icon: '/icon.png',
          badge: '/badge.png',
          requireInteraction: true, // Keep notification visible
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await fcm.sendEachForMulticast(message);
    console.log(`✅ FCM notifications sent: ${response.successCount} success, ${response.failureCount} failed`);

    // Handle failed tokens and clean up invalid ones
    if (response.failureCount > 0) {
      const invalidTokensToCleanup: string[] = [];
      
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const token = validTokens[idx];
          const error = res.error;
          
          console.error(`❌ Failed for token[${token.substring(0, 20)}...]:`, error?.code || error?.message);
          
          // Check if this is an invalid token error that requires cleanup
          if (error && isInvalidTokenError(error)) {
            invalidTokensToCleanup.push(token);
            console.log(`🗑️ Marking token for cleanup: ${token.substring(0, 20)}... (Error: ${error.code})`);
          }
        }
      });

      // Clean up invalid tokens asynchronously (don't wait for it)
      if (invalidTokensToCleanup.length > 0) {
        console.log(`🧹 Cleaning up ${invalidTokensToCleanup.length} invalid FCM token(s)...`);
        // Run cleanup in background without blocking the response
        Promise.all(invalidTokensToCleanup.map(token => cleanupInvalidToken(token)))
          .catch(err => {
            console.error(`❌ Error during token cleanup:`, err);
          });
      }
    }

    return response;
  } catch (error: any) {
    console.error("❌ Error sending FCM notification:", error);
    // Don't throw - log the error and return null
    // This prevents FCM errors from crashing the order flow
    console.error("FCM Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    return null;
  }
}
