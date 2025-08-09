Got it — since you’re using  **React Native** , the flow is a bit different from web, and you’ll need to set up **separate Firebase apps for Android and iOS** because FCM credentials differ per platform.

Here’s how you should proceed:

---

## **1️⃣ Create Firebase Projects for Mobile Push**

* You don’t need **two Firebase projects** — one project is enough.
* Inside **one project** (`lastbite-e8d36`), create  **two Firebase apps** :
  * One for **Android**
  * One for **iOS**

---

## **2️⃣ Setup Android in Firebase**

1. Go to **Project Settings** → **General** → **Your apps** → **Add app** →  **Android** .
2. **Android package name** → use your React Native app’s package name (e.g., `com.lastbite.app`).
3. Download the `google-services.json` file.
4. Place it in:
   ```
   android/app/google-services.json
   ```
5. Enable **Firebase Cloud Messaging** in:
   ```
   Firebase Console → Project Settings → Cloud Messaging
   ```
6. Enable **Push** in `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'

   dependencies {
       implementation platform('com.google.firebase:firebase-bom:33.1.2')
       implementation 'com.google.firebase:firebase-messaging'
   }
   ```

---

## **3️⃣ Setup iOS in Firebase**

1. Add a new app in **Project Settings** → **Add app** →  **iOS** .
2. Use your iOS **Bundle Identifier** from `ios/Runner.xcodeproj`.
3. Download the `GoogleService-Info.plist`.
4. Add it to:
   ```
   ios/GoogleService-Info.plist
   ```
5. Enable Push Notifications & Background Modes in Xcode.
6. Install CocoaPods:
   ```sh
   cd ios && pod install && cd ..
   ```
7. Add Firebase Messaging to iOS dependencies:
   ```ruby
   # ios/Podfile
   pod 'Firebase/Messaging'
   ```

---

## **4️⃣ Install React Native FCM**

You’ll need the official Firebase JS SDK wrapper for RN.

```sh
npm install @react-native-firebase/app @react-native-firebase/messaging
```

---

## **5️⃣ Request Permission & Get Token**

`src/utils/fcm.ts`

```ts
import messaging from '@react-native-firebase/messaging';

// Request permissions (iOS only)
export async function requestFCMPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

// Get FCM token
export async function getFCMToken() {
  const token = await messaging().getToken();
  return token;
}

// Listen for token refresh
export function onTokenRefresh(callback: (token: string) => void) {
  messaging().onTokenRefresh(callback);
}
```

---

## **6️⃣ Login Flow with Token Handling**

In your login screen:

```ts
import { requestFCMPermission, getFCMToken } from "@/utils/fcm";
import axios from "axios";

async function handleLogin(email: string, password: string) {
  const { data } = await axios.post("/auth/login", { email, password });

  // FCM Setup
  const hasPermission = await requestFCMPermission();
  if (!hasPermission) return;

  const token = await getFCMToken();
  const deviceName = `${Platform.OS} - ${DeviceInfo.getModel()}`;

  // Send token to backend
  await axios.patch("/user/fcm-token", { token, deviceName }, {
    headers: { Authorization: `Bearer ${data.accessToken}` },
  });
}
```

---

## **7️⃣ Notes for You**

* Android & iOS **tokens are different** — your backend needs to store them separately under the same user.
* React Native automatically handles token refresh events with `onTokenRefresh`.
* Testing push notifications:
  * Android: You can send directly from Firebase Console.
  * iOS: You need APNs configured in Firebase.


## **7️⃣ FLOW SETUP**

* **Check for FCM tokens after login**

  When the user logs in and you fetch their profile (`user.fcmTokens`), prepare to validate against the current device’s token.
* **Identify this device**

  Use a unique `deviceName` string that clearly distinguishes platform + model (e.g., `android - Pixel 6`, `ios - iPhone 14`).
* **If `user.fcmTokens` is empty**

  Generate a new FCM token for this device and send it to the backend with `deviceName`.
* **If this device’s `deviceName` is not found in `user.fcmTokens`**

  Treat it as a new device — generate an FCM token and send it to the backend.
* **If `deviceName` exists but token is different**

  Update the backend with the new token to replace the old one.
* **Handle token refresh events**

  If Firebase generates a new token via `onTokenRefresh`, immediately send it to the backend with the same `deviceName`.
* **Multiple device support**

  Backend must allow multiple `{ deviceName, token }` pairs per user.

  Android and iOS tokens must be stored separately, even for the same user.

* Android & iOS **tokens are different** — your backend needs to store them separately under the same user.
* React Native automatically handles token refresh events with `onTokenRefresh`.
* Testing push notifications:
  * Android: You can send directly from Firebase Console.
  * iOS: You need APNs configured in Firebase.
