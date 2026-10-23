# Google Play: Data safety form

Where: Play Console, the app, **Policy and programs**, **App content**, **Data safety**. These answers give the listing **No data collected** and **No data shared with third parties**. They hold for version 1.1.0 (23 October 2026) and for the web game, which stores nothing on any server either.

## Step 1: Overview

Read it and choose **Next**.

## Step 2: Data collection and security

* **Does your app collect or share any of the required user data types?** Choose **No**.
* If Play asks whether users can create an account, answer that the app does not let users create an account: there is no login of any kind.

Answering **No** skips the questions about encryption in transit and deletion requests, and the **Data types** and **Data usage and handling** steps, because they only apply to data that leaves the device.

## Step 3: Preview

The preview shows **No data collected** and **No data shared with third parties**. Choose **Save**. The change goes to review with the next release you send.

## Why the answer is No

Google counts data as collected only when it is sent off the device, and as shared only when it is sent to someone else. The app sends nothing:

| What the player does | Where the data goes |
|---|---|
| Plays, keeps a streak, earns badges and levels | Saved in the app's own storage on the phone, never sent |
| Types a name on the certificate | Saved on the phone and drawn into the certificate image on the phone |
| Shares a result, a tip or the certificate | Only after tapping Share, through the phone's share sheet, to the app the player picks. Google exempts transfers that the user starts and expects |
| Pastes a message into the checker | Checked on the phone and discarded when the screen closes |
| Plays a call or a voice note | The recordings ship inside the app |

The Android manifest lists INTERNET (a Capacitor default that the app never uses to send anything) and VIBRATE, and no advertising ID. The app has no analytics, crash reporting, ads or third party SDKs that send data.

## Privacy policy

* English: https://siteq8.github.io/scam-game/privacy/
* Arabic: https://siteq8.github.io/scam-game/ar/privacy/

## App Store, for comparison

In App Store Connect, **App Privacy**: **No, we do not collect data from this app**, so the product page shows **Data Not Collected**. The privacy manifest in the app (`ios/App/App/PrivacyInfo.xcprivacy`) declares no tracking and no collected data, with the reasons for the APIs the app uses on the device: UserDefaults (CA92.1) for progress and file timestamps (C617.1) for the certificate image written to the cache before it is shared.
