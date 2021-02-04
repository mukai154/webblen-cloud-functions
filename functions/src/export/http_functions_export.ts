import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as corsModule from 'cors';
const cors = corsModule({origin: true});

import * as agoraFunctions from '../cloud_functions/agora_functions';
import * as algoliaKeys from '../utils/algolia_keys';
import * as eventFunctions from "../cloud_functions/event_functions";
import * as locationFunctions from '../utils/location_functions';
import * as notifActionFunctions from '../cloud_functions/notification_functions/action_notif_functions';
import * as notifNonactionFunctions from "../cloud_functions/notification_functions/nonaction_notif_functions";
import * as sendGridFunctions from '../cloud_functions/send_grid_functions';
import * as stripeFunctions from '../cloud_functions/stripe_functions/stripe_functions';
import * as stripeWebFunctions from '../cloud_functions/stripe_functions/stripe_web_functions';
import * as ticketFunctions from '../cloud_functions/ticket_functions';
import * as userFunctions from '../cloud_functions/user_functions';

//EVENT CHECK IN/OUT
export const checkIntoEvent = functions.https.onCall((data, context) => {
    return eventFunctions.checkIntoEvent(data, context);
});

export const checkOutOfEvent = functions.https.onCall((data, context) => {
    return eventFunctions.checkOutOfEvent(data, context);
});

// https://us-central1-webblen-events.cloudfunctions.net/fixBrokenEvents
export const fixBrokenEvents = functions.https.onRequest((data, context) => {
    return eventFunctions.fixBrokenEvents(data, context);
});

// https://us-central1-webblen-events.cloudfunctions.net/notifyUsersOfSpecificEvent
export const notifyUsersOfSpecificEvent = functions.https.onRequest((data, context) => {
    return notifNonactionFunctions.notifyUsersOfSpecificEvent(data, context);
});

//** notif actions */
export const notifyFollowersStreamIsLive = functions.https.onCall((data) => {
    return notifNonactionFunctions.notifyFollowersStreamIsLive(data);
});

//posts
export const sendPostCommentNotification = functions.https.onCall((data, context) => {
    return notifActionFunctions.sendPostCommentNotification(data, context);
});

export const sendPostCommentReplyNotification = functions.https.onCall((data, context) => {
    return notifActionFunctions.sendPostCommentReplyNotification(data, context);
});

//tickets
export const getPurchasedTickets = functions.https.onCall((data, context) => {
    return ticketFunctions.getPurchasedTickets(data, context);
});

export const getTicketDistro = functions.https.onCall((data, context) => {
    return ticketFunctions.getTicketDistro(data, context);
});

export const checkIfTicketIsValid = functions.https.onCall((data, context) => {
    return ticketFunctions.checkIfTicketIsValid(data, context);
});


// ** EXPORT DATA TO ALGOLIA */
// export const exportAppInfoToAlgolia = functions.https.onRequest(async (req, res) => {
//     const infoArr = []; 
//     const appDoc = await admin.firestore().collection('app_release_info').doc('general').get();
//     const collectionToExport = appDoc.data()!.collectionToExport;

//     const query = await admin.firestore().collection(collectionToExport).get();
//     for (const doc of query.docs){
//         const event = doc.data();
//         event.objectID = doc.id;
//         infoArr.push(event);
//     }

//     const algoliaClient = algoliasearch(algoliaKeys.ALGOLIA_APP_ID, algoliaKeys.ALGOLIA_API_KEY);
//     const index = algoliaClient.initIndex(collectionToExport);

//     index.saveObjects(infoArr, (err, content) => {
//         res.status(200).send(content)
//     })
// });

export const exportAppInfoToAlgolia = functions.https.onRequest(async (req, res) => {
    const comArr = []; 
    const eventArr = []; 
    const userArr = []; 
    
    //EXPORT COMMUNITIES
    const locQuery = await admin.firestore().collection('locations').get();
    for (const doc of locQuery.docs){
        const areaName = doc.id;
        const areaQuery = await admin.firestore().collection('locations').doc(areaName).collection('communities').get();
        for (const comDoc of areaQuery.docs){
            const data = comDoc.data();
            if (data.memberIDs !== undefined && data.memberIDs.length >= 3){
                data.objectID = data.areaName + "/" + data.name;
                comArr.push(data);
            }
        }
    }
    
    await algoliaKeys.ALGOLIA_COMMUNITIES_INDEX.saveObjects(comArr)

    //EXPORT EVENTS
    const eventQuery = await admin.firestore().collection('upcoming_events').get();
    for (const doc of eventQuery.docs){
        const data = doc.data();
        data.objectID = doc.id;
        eventArr.push(data);
    }
    await algoliaKeys.ALGOLIA_EVENTS_INDEX.saveObjects(eventArr)

    //EXPORT USERS
    const userQuery = await admin.firestore().collection('webblen_user').get();
    for (const doc of userQuery.docs){
        const data = doc.data();
        data.objectID = doc.id;
        userArr.push(data);
    }
    algoliaKeys.ALGOLIA_USERS_INDEX.saveObjects(userArr, (err, content) => {
        res.status(200).send(content)
    })
});

export const exportEventsToAlgolia = functions.https.onRequest(async (req, res) => {
    const eventArr = []; 
    const eventQuery = await admin.firestore().collection('events').get();
    for (const doc of eventQuery.docs){
        const data = doc.data();
        data.objectID = doc.id;
        eventArr.push(data);
    }
    // algoliaFunctions.ALGOLIA_EVENTS_INDEX.saveObjects(eventArr, (err, content) => {
    //     res.status(200).send(content);
    // });
});

//** DEPOSIT WEBBLEN TO WALLETS */ 
//https://us-central1-webblen-events.cloudfunctions.net/depositWebblenToUserWallets
export const depositWebblenToUserWallets = functions.https.onRequest(async (req, res) => {
    const userQuery = await admin.firestore().collection('webblen_user').get();
    for (const userDoc of userQuery.docs){
        const userData = userDoc.data();
        const userWebblen = userData.d.eventPoints;
        const newWalletAmount = userWebblen + 12.25;
        await admin.firestore().collection('webblen_user').doc(userDoc.id).update({
            "d.eventPoints": newWalletAmount
        });
    }
});

//** LOCATION FUNCTIONS */
export const findNearestZipcodes = functions.https.onCall((data, context) => {
    return locationFunctions.findNearestZipcodes(data, context);
});

export const reverseGeocodeLatLon = functions.https.onCall((data, context) => {
    return locationFunctions.reverseGeocodeLatLon(data, context);
});


//** STRIPE */
//https://us-central1-webblen-events.cloudfunctions.net/manuallyAcceptStripeTOS
export const manuallyAcceptStripeTOS = functions.https.onRequest(async (req, res) => {
    await stripeFunctions.manuallyAcceptStripeTOS();
});

export const connectStripeCustomAccount = functions.https.onRequest(async (req, res) => {
    let stripeUID;
    //const authCode = req.query.code;
    const uid = req.query.uid as string;
    console.log(uid);
    
    const stripe = require('stripe')('sk_live_2g2I4X6pIDNbJGHy5XIXUjKr00IRUj3Ngx');
    
    const associatedStripeAcct = await admin.firestore().collection('stripe').doc(uid).get();
    if (associatedStripeAcct.exists){
        stripeUID = associatedStripeAcct.data()!.stripeUID;
    } else {
        const newStripeAcct = await stripe.accounts.create(
            {
              type: 'custom',
              country: 'US',
              requested_capabilities: [
                'card_payments',
                'transfers',
              ],
              settings: {
                  payouts: {
                    schedule: {
                        delay_days: 2,
                        interval: "weekly",
                        weekly_anchor: "monday",
                    }
                  },
              }
            },

          );
          stripeUID = newStripeAcct.id;
        await admin.firestore().collection('stripe').doc(uid).set({
            "stripeUID": stripeUID,
            "verified": "unverified",
            "availableBalance": 0.0001,
            "pendingBalance": 0.0001,
        });
    }

    const stripeAccountLinkResponse = await stripe.accountLinks.create(
        {
          account: stripeUID,
          failure_url: 'https://webblen.io/earnings-failed',
          success_url: 'https://us-central1-webblen-events.cloudfunctions.net/completeStripeCustomeAcctRegistration?uid=' + uid,
          type: 'custom_account_verification',
          collect: 'eventually_due',
        },
      );

    res.redirect(stripeAccountLinkResponse.url);

  });


export const completeStripeCustomeAcctRegistration = functions.https.onRequest(async (req, res) => {
    const uid = req.query.uid as string;
    await admin.firestore().collection('stripe').doc(uid).update({
        "verified": "pending",
    });
    res.redirect('https://webblen.io/earnings-success');
});


export const submitBankingInfoToStripe = functions.https.onCall((data, context) => {
    return stripeFunctions.submitBankingInfo(data, context);
});

export const submitCardInfoToStripe = functions.https.onCall((data, context) => {
    return stripeFunctions.submitCardInfo(data, context);
});

export const checkAccountVerificationStatus = functions.https.onCall((data, context) => {
    return stripeFunctions.checkAccountVerificationStatus(data, context);
});

export const getStripeAccountBalance = functions.https.onCall((data, context) => {
    return stripeFunctions.getStripeAccountBalance(data, context);
});

export const performInstantStripePayout = functions.https.onCall((data, context) => {
    return stripeFunctions.performInstantStripePayout(data, context);
});

export const submitTicketPurchaseToStripe = functions.https.onCall((data, context) => {
    return stripeFunctions.submitTicketPurchaseToStripe(data, context);
});

export const testPurchaseTickets = functions.https.onCall((data, context) => {
    return stripeFunctions.testPurchaseTickets(data, context);
});
///https://us-central1-webblen-events.cloudfunctions.net/haveEveryoneFollowWebblen
export const haveEveryoneFollowWebblen = functions.https.onRequest((data, context) => {
    return userFunctions.haveEveryoneFollowWebblen(data, context);
});




//WEB FUNCTIONS
export const testWebPurchaseTickets = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return stripeWebFunctions.testPurchaseTickets(req,res);
    });
});

export const liveWebPurchaseTickets = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return stripeWebFunctions.livePurchaseTickets(req,res);
    });
});

export const submitBankingInfoWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return stripeWebFunctions.submitBankingInfoWeb(req,res);
    });
});

export const submitCardInfoWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return stripeWebFunctions.submitCardInfoWeb(req,res);
    });
});


//** AGORA CLOUD RECORDING */
//https://us-central1-webblen-events.cloudfunctions.net/testCloudRecording
export const testCloudRecording = functions.https.onRequest(async (req, res) => {
    await agoraFunctions.testAgoraCloudRecording();
});

export const retrieveAgoraToken = functions.https.onCall((data) => {
    return agoraFunctions.retrieveAgoraToken(data);
}); 

export const acquireAgoraResourceID = functions.https.onCall((data) => {
    return agoraFunctions.acquireAgoraResourceID(data);
}); 

export const startAgoraCloudRecording = functions.https.onCall((data) => {
    return agoraFunctions.startAgoraCloudRecording(data);
}); 


//EMAIL
export const sendEmailConfirmation = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return sendGridFunctions.sendEmailConfirmation(req,res);
    });
});
// export const sendEmailConfirmation = functions.https.onCall((data, res) => {
//     return sendgridFunctions.sendEmailConfirmation(data,res);
// });
