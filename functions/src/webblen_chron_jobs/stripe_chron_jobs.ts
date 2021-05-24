// Firebase Imports
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';

// Custom Imports
import * as stripeService from "../services_general/stripe/stripe_service";

//DB REFS
const database = admin.firestore();
const stripeConnectAccountRef = database.collection('stripe');


export const processWeeklyStripePayout = functions
.pubsub 
.schedule('every mon 08:00')
//.schedule('every 2 minutes')
.timeZone('America/Chicago')
.onRun(async (event) => {
    console.log(event);
    const stripeAccountDocs = await stripeConnectAccountRef.get();
    for (const doc of stripeAccountDocs.docs){
        const data = {"uid": doc.id, "stripeUID": doc.data().stripeUID};
        await stripeService.processStandardPayout(data);
    }
});