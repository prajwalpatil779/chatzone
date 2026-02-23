/**
 * Firebase Cloud Messaging Utility
 * Handles push notifications
 */

const admin = require('firebase-admin');

// Initialize Firebase if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (error) {
    console.log('Firebase initialization skipped (optional for development)');
  }
}

// Send push notification
const sendPushNotification = async (
  fcmToken,
  title,
  body,
  data = {},
  options = {}
) => {
  if (!fcmToken || !admin.apps.length) {
    return { success: false, message: 'FCM token or Firebase not available' };
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
      webpush: {
        headers: {
          TTL: '86400',
        },
      },
      token: fcmToken,
      ...options,
    };

    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('FCM error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to multiple users
const sendMulticastNotification = async (
  fcmTokens,
  title,
  body,
  data = {}
) => {
  if (!fcmTokens || fcmTokens.length === 0 || !admin.apps.length) {
    return { success: false, message: 'No tokens or Firebase not available' };
  }

  try {
    const message = {
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
      webpush: { headers: { TTL: '86400' } },
    };

    const response = await admin.messaging().sendMulticast({
      tokens: fcmTokens,
      ...message,
    });

    return { success: true, response };
  } catch (error) {
    console.error('Multicast FCM error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
};
