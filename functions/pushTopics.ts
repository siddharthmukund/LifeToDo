import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Subscribes or unsubscribes a user's tokens to/from an FCM topic.
 */
export async function manageUserTopic(
    uid: string,
    topic: string,
    action: 'subscribe' | 'unsubscribe'
) {
    const tokensSnapshot = await admin.firestore().collection(`users/${uid}/push_tokens`).get();

    if (tokensSnapshot.empty) return;
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    try {
        if (action === 'subscribe') {
            await admin.messaging().subscribeToTopic(tokens, topic);
            console.log(`Successfully subscribed user ${uid} to topic ${topic}.`);
        } else {
            await admin.messaging().unsubscribeFromTopic(tokens, topic);
            console.log(`Successfully unsubscribed user ${uid} from topic ${topic}.`);
        }
    } catch (error) {
        console.error(`Error managing topic ${topic} for user ${uid}:`, error);
    }
}

/**
 * Sends a message to a specific topic (e.g., 'review_reminders', 'pro_users').
 */
export async function sendTopicPush(
    topic: string,
    payload: { title: string; body: string; data?: any }
) {
    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: payload.data || {},
        topic: topic,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message to topic:', response);
    } catch (error) {
        console.error('Error sending topic push:', error);
    }
}
