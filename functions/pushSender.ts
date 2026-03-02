import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Sends a targeted push notification to specific users.
 */
export async function sendTargetedPush(
    uid: string,
    payload: {
        title: string;
        body: string;
        type: string;
        targetScreen?: string;
        targetId?: string;
    }
) {
    const tokensSnapshot = await admin.firestore().collection(`users/${uid}/push_tokens`).get();

    if (tokensSnapshot.empty) {
        console.log(`No push tokens found for user ${uid}.`);
        return;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: {
            type: payload.type,
            targetScreen: payload.targetScreen || '',
            targetId: payload.targetId || '',
        },
        tokens: tokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent message to user ${uid}:`, response.successCount);
        // Handle cleanup of invalid tokens here
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            // Iterate failedTokens and remove from Firestore if error is 'messaging/invalid-registration-token' etc.
        }
    } catch (error) {
        console.error('Error sending targeted push:', error);
    }
}
