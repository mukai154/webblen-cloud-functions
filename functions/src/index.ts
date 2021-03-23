import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as corsModule from 'cors';
const cors = corsModule({origin: true});


admin.initializeApp(functions.config().firebase);

import * as userFunctions from './user_functions/crud'
import * as scheduleUserFunctions from './scheduled_user_functions/index'
import * as eventFunctions from './event_functions/crud'
import * as notificationFunctions from './remote_notif_functions/index'
import * as notifActionFunctions from './notif_action_functions/index'
import * as jobFunctions from './scheduled_event_functions/index'
import * as transactionFunctions from './transaction_functions/index'
import * as algoliaFunctions from './algolia/keys'
import * as stripeFunctions from './stripe_functions/index'
import * as ticketFunctions from './ticket_functions/crud'
import * as stripeWebFunctions from './stripe_functions/web'
import * as locationFunctions from './location_functions/index'
import * as sendgridFunctions from './send_grid_functions/index'
import * as agoraFunctions from './agora/index'

//** users */
export const getUserByID = functions.https.onCall((data, context) => {
    return userFunctions.getUserByID(data, context);
});

export const getUsersFromList = functions.https.onCall((data, context) => {
    return userFunctions.getUsersFromList(data, context);
});

export const getUsername = functions.https.onCall((data, context) => {
    return userFunctions.getUsername(data, context);
});

export const getUserByName = functions.https.onCall((data, context) => {
    return userFunctions.getUserByName(data, context);
});

export const getUserProfilePicURL = functions.https.onCall((data, context) => {
    return userFunctions.getUserProfilePicURL(data, context);
});


// export const getNearbyUsers = functions.https.onCall((data, context) => {
//     return userFunctions.getNearbyUsers(data, context);
// });

// export const getNumberOfNearbyUsers = functions.https.onCall((data, context) => {
//     return userFunctions.getNumberOfNearbyUsers(data, context);
// });

// export const get10RandomUsers = functions.https.onCall((data, context) => {
//     return userFunctions.get10RandomUsers(data, context);
// });

export const updateUserCheckIn = functions.https.onCall((data, context) => {
    return userFunctions.updateUserCheckIn(data, context);
});

export const updateUserProfilePic = functions.https.onCall((data, context) => {
    return userFunctions.updateUserProfilePic(data, context);
});

export const updateUserNotifPreferences = functions.https.onCall((data, context) => {
    return userFunctions.updateUserNotifPreferences(data, context);
});

//** events */
export const getEventByKey = functions.https.onCall((data, context) => {
    return eventFunctions.getEventByKey(data, context);
});

export const getUserEventHistory = functions.https.onCall((data, context) => {
    return eventFunctions.getUserEventHistory(data, context);
});

export const getCreatedEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getCreatedEvents(data, context);
});

export const getEventsForTicketScans = functions.https.onCall((data, context) => {
    return eventFunctions.getEventsForTicketScans(data, context);
});

export const getsSavedEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getSavedEvents(data, context);
});

export const getEventAttendees = functions.https.onCall((data, context) => {
    return eventFunctions.getEventAttendees(data, context);
});

export const getEventsNearLocation = functions.https.onCall((data, context) => {
    return eventFunctions.getEventsNearLocation(data, context);
});

// export const getActiveEventsNearLocation = functions.https.onCall((data, context) => {
//     return eventFunctions.getActiveEventsNearLocation(data, context);
// });

export const getEventsForCheckIn = functions.https.onCall((data, context) => {
    return eventFunctions.getEventsForCheckIn(data, context);
});

export const getUpcomingCommunityEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getUpcomingCommunityEvents(data, context);
});

export const getRecurringCommunityEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getRecurringCommunityEvents(data, context);
});

export const getExclusiveWebblenEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getExclusiveWebblenEvents(data, context);
});

export const getRecommendedEvents = functions.https.onCall((data, context) => {
    return eventFunctions.getRecommendedEvents(data, context);
});

export const areCheckInsAvailable = functions.https.onCall((data, context) => {
    return eventFunctions.areCheckInsAvailable(data, context);
});

export const checkInAndUpdateEventPayout = functions.https.onCall((data, context) => {
    return eventFunctions.checkInAndUpdateEventPayout(data, context);
});

export const checkoutAndUpdateEventPayout = functions.https.onCall((data, context) => {
    return eventFunctions.checkoutAndUpdateEventPayout(data, context);
});

export const updateEventViews = functions.https.onCall((data, context) => {
    return eventFunctions.updateEventViews(data, context);
});



export const convertRadiusToDouble = functions
.firestore
.document('recurring_events/{event}')
.onCreate(event => {
 return eventFunctions.convertRadiusToDouble(event);
});

export const validateEventGeoData = functions
.firestore
.document('upcoming_events/{event}')
.onCreate(event => {
 return eventFunctions.validateGeoData(event);
});

//** notif actions */
export const notifyFollowersStreamIsLive = functions.https.onCall((data) => {
    return notificationFunctions.notifyFollowersStreamIsLive(data);
});

//**c
//**
//** 
//TRIGGER EVENTS

//users
export const createUserTrigger = functions
.firestore
.document('webblen_user/{user}')
.onCreate(async event => {
    const data = event.data();
    const objectID = event.id;
    return algoliaFunctions.ALGOLIA_USERS_INDEX.addObject({...data, objectID});
});

export const updateUserTrigger = functions
.firestore
.document('webblen_user/{user}')
.onUpdate(async event => {
    const data = event.after.data();
    const objectID = event.after.id;    
    const prevUserData = event.before.data().d;
    const newUserData = data.d;  

    const prevPoints = prevUserData.eventPoints;
    const newPoints = newUserData.eventPoints;

    const prevFollowers = prevUserData.followers;
    const newFollowers = newUserData.followers;

    if (newPoints > prevPoints){
        await notificationFunctions.userDepositNotification(event);
    } else if (newFollowers.length > prevFollowers.length){
        await notificationFunctions.newFollowerNotification(event);
    }
    await algoliaFunctions.ALGOLIA_USERS_INDEX.saveObject({...data, objectID});
    return;  
});

export const deleteUserTrigger = functions
.firestore
.document('webblen_user/{user}')
.onDelete(async event => {
    const objectID = event.id;
    await algoliaFunctions.ALGOLIA_USERS_INDEX.deleteObject(objectID);
});


//events
export const createWebblenEventTrigger = functions
.firestore
.document('events/{eventPost}')
.onCreate(async event => {
    const data = event.data().d;
    const objectID = event.id;
    await eventFunctions.createWebblenEventTrigger(data);
    await algoliaFunctions.ALGOLIA_WEBLLEN_EVENTS_INDEX.addObject({...data, objectID});
    return;
    //return notificationFunctions.sendNewCommunityEventNotification(event);
});

export const updateWebblenEventTrigger = functions
.firestore
.document('events/{eventPost}')
.onUpdate(async event => {
    const data = event.after.data().d;
    const objectID = data.id;
    console.log('updating ' + objectID);
    await eventFunctions.createWebblenEventTrigger(data);
    await algoliaFunctions.ALGOLIA_WEBLLEN_EVENTS_INDEX.saveObject({...data, objectID});
    return;
    //return notificationFunctions.sendNewCommunityEventNotification(event);
});

export const deleteWebblenEventTrigger = functions
.firestore
.document('events/{eventPost}')
.onDelete(async event => {
    const objectID = event.id;
    await eventFunctions.createWebblenEventTrigger(event);
    return algoliaFunctions.ALGOLIA_WEBLLEN_EVENTS_INDEX.deleteObject(objectID);
});

export const createScrapedEventTrigger = functions
.firestore
.document('scraped_events/{eventPost}')
.onCreate(async event => {
    const data = event.data();
    const objectID = event.id;
    await eventFunctions.createScrapedEventTrigger(data);
    await algoliaFunctions.ALGOLIA_WEBLLEN_EVENTS_INDEX.addObject({...data, objectID});
    return;
    //return notificationFunctions.sendNewCommunityEventNotification(event);
});

export const deleteEventTrigger = functions
.firestore
.document('upcoming_events/{eventPost}')
.onDelete(async event => {
    const objectID = event.id;
    return algoliaFunctions.ALGOLIA_EVENTS_INDEX.deleteObject(objectID);
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

//chats
export const updateChatTrigger = functions
.firestore
.document('chats/{chat}')
.onUpdate(event => {
 return notificationFunctions.sendMessageReceivedNotification(event);
});

//transactions
export const updateTransactionTrigger = functions
.firestore
.document('transactions/{transaction}')
.onUpdate(event => {
 return transactionFunctions.sendTransactionRefNotif(event);
});

//**
//**
//** 
//SCHEDULED EVENTS
export const setDailyCheckInsAmerciaChicago = functions
.pubsub    
.schedule('every day 08:00')
.timeZone('America/Chicago')
.onRun(event => {
    return jobFunctions.setDailyCheckInsAmericaChicago(event);
});

export const setWeeklyCheckInsAmerciaChicago = functions
.pubsub 
.schedule('every sun 08:00')
.timeZone('America/Chicago')
.onRun(event => {
    return jobFunctions.setWeeklyCheckInsAmericaChicago(event);
});

export const distributeEventPoints = functions
.pubsub 
.schedule('every 3 hours')
.timeZone('America/Chicago')
.onRun(event => {

    return jobFunctions.distributeEventPoints(event);
});

export const addViewsToEvents = functions
.pubsub    
.schedule('every 8 hours')
.timeZone('America/Chicago')
.onRun(event => {
    return eventFunctions.addViewsToEvents(event);
});

// export const sendNotifForNoonAppOpens = functions
// .pubsub    
// .schedule('every day 13:30')
// .timeZone('America/Chicago')
// .onRun(event => {
//     return userFunctions.sendDailyNotification(event);
// });

// export const sendNotifEveningAppOpens = functions
// .pubsub    
// .schedule('every day 18:00')
// .timeZone('America/Chicago')
// .onRun(event => {
//     return userFunctions.sendDailyEveningNotification(event);
// });

export const deleteOldNotifications = functions
.pubsub    
.schedule('every day 08:00')
.timeZone('America/Chicago')
.onRun(event => {
    return notifActionFunctions.deleteOldNotifications(event);
});

export const rechargeUserAP = functions
.pubsub 
.schedule('every 3 hours')
.timeZone('America/Chicago')
.onRun(event => {
    return scheduleUserFunctions.rechargeUserAP(event);
});

// export const scrapeMidwestEvents = functions
// .pubsub    
// .schedule('every 2 minutes')
// .timeZone('America/Chicago')
// .onRun(event => {
//     return eventScrapeFunctions.scrapeEventsInMidwest(event);
// });

// export const setEventRecommendations = functions
// .pubsub 
// .schedule('every 1 minutes')
// .timeZone('America/Chicago')
// .onRun(event => {
//     return jobFunctions.setEventRecommendations(event);
// });

//**
//**
//** 
//COMMUNITY EVENTS
// export const updateCommunityFollowers = functions
// .firestore
// .document('users/{user}'
// .onCreate(event => {
//     return communityFunctions.
// });
// export const newCommunityResponder = functions
// .firestore
// .document('available_locations/{area}/communities/{community}')
// .onCreate(event => {
//     return communityFunctions.
// });

//** EXPORT DATA TO ALGOLIA */
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

// export const exportAppInfoToAlgolia = functions.https.onRequest(async (req, res) => {
//     const comArr = []; 
//     const eventArr = []; 
//     const userArr = []; 
    
//     //EXPORT COMMUNITIES
//     const locQuery = await admin.firestore().collection('locations').get();
//     for (const doc of locQuery.docs){
//         const areaName = doc.id;
//         const areaQuery = await admin.firestore().collection('locations').doc(areaName).collection('communities').get();
//         for (const comDoc of areaQuery.docs){
//             const data = comDoc.data();
//             if (data.memberIDs !== undefined && data.memberIDs.length >= 3){
//                 data.objectID = data.areaName + "/" + data.name;
//                 comArr.push(data);
//             }
//         }
//     }
    
//     await algoliaFunctions.ALGOLIA_COMMUNITIES_INDEX.saveObjects(comArr)

//     //EXPORT EVENTS
//     const eventQuery = await admin.firestore().collection('upcoming_events').get();
//     for (const doc of eventQuery.docs){
//         const data = doc.data();
//         data.objectID = doc.id;
//         eventArr.push(data);
//     }
//     await algoliaFunctions.ALGOLIA_EVENTS_INDEX.saveObjects(eventArr)

//     //EXPORT USERS
//     const userQuery = await admin.firestore().collection('webblen_user').get();
//     for (const doc of userQuery.docs){
//         const data = doc.data();
//         data.objectID = doc.id;
//         userArr.push(data);
//     }
//     algoliaFunctions.ALGOLIA_USERS_INDEX.saveObjects(userArr, (err, content) => {
//         res.status(200).send(content)
//     })
// });

//** DEPOSIT WEBBLEN TO WALLETS */ //https://us-central1-webblen-events.cloudfunctions.net/depositWebblenToUserWallets
export const depositWebblenToUserWallets = functions.https.onRequest(async (req, res) => {
    const userQuery = await admin.firestore().collection('webblen_user').get();
    for (const userDoc of userQuery.docs){
        const userData = userDoc.data();
        const userWebblen = userData.d.eventPoints;
        const newWalletAmount = userWebblen + 49.99;
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
export const retrieveAgoraToken = functions.https.onCall((data) => {
    return agoraFunctions.retrieveAgoraToken(data);
}); 

export const startAgoraCloudRecording = functions.https.onCall((data) => {
    return agoraFunctions.startAgoraCloudRecording(data);
}); 


//** EXPORT DATA TO ALGOLIA */


//EMAIL
export const sendEmailConfirmationViaWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return sendgridFunctions.sendEmailConfirmationWeb(req,res);
    });
});

export const sendEmailConfirmation = functions.https.onCall((data, res) => {
    return sendgridFunctions.sendEmailConfirmation(data,res);
});
//EXPORT EVENTS
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