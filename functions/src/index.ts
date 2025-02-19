import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// List all users function
export const listUsers = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const adminRef = await admin.firestore().collection('adminUsers').doc(context.auth.uid).get();
  const isAdmin = adminRef.exists || context.auth.token.email === 'admin@admin.com';

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
  }

  try {
    const listUsersResult = await admin.auth().listUsers();
    return { users: listUsersResult.users };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError('internal', 'Error listing users');
  }
});

// Rest of your functions...
