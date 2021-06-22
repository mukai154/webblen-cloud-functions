// Firebase Imports
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'

// Custom Imports
import * as notificationService from "../services_general/notifications/notifications_service";

// Data Collections
const database = admin.firestore();
const userRef = database.collection('webblen_users');

//Helper Functions
async function getUserMessageToken(uid: any){
    let messageToken;
    const snapshot = await userRef.doc(uid).get();
    if (snapshot.exists){
        const data = snapshot.data()!;
        if (data.messageToken !== undefined){
            messageToken = data.messageToken;
        }
    }
    return messageToken;
}


// Exports
export const createWebblenNotificationTrigger = functions.firestore
	.document("webblen_notifications/{notification}")
	.onCreate(async (event) => {
        const data = event.data();
        const receiverUID = data.receiverUID;
        const title = data.header;
        const body = data.subHeader;
        const type = data.type;
        const messageToken = await getUserMessageToken(receiverUID);
        if (messageToken !== undefined){
            await notificationService.sendNotificationToSingleDevice(title, body, type, messageToken);
        }
		return;
	});
