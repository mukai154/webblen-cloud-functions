// import * as functions from 'firebase-functions';

// import * as algoliaKeys from '../utils/algolia_keys';
// import * as eventFunctions from "../services/firestore/webblen_event_service";
// import * as actionNotifFunctions from '../webblen_cloud_functions/notification_functions/action_notif_functions';
// import * as nonactionNotifFunctions from "../webblen_cloud_functions/notification_functions/nonaction_notif_functions";
// import * as webblenFunctions from "../webblen_cloud_functions/webblen_functions";

// // USERS
// export const createUserTrigger = functions
//     .firestore
//     .document('webblen_user/{user}')
//     .onCreate(async event => {
//         const data = event.data();
//         const objectID = event.id;
//         await webblenFunctions.addWebblenToFollowers(data);
//         return algoliaKeys.ALGOLIA_USERS_INDEX.addObject({ ...data, objectID });
//     });

// export const updateUserTrigger = functions
//     .firestore
//     .document('webblen_user/{user}')
//     .onUpdate(async event => {
//         const data = event.after.data();
//         const objectID = event.after.id;
//         const prevUserData = event.before.data().d;
//         const newUserData = data.d;

//         const prevPoints = prevUserData.eventPoints;
//         const newPoints = newUserData.eventPoints;

//         const prevFollowers = prevUserData.followers;
//         const newFollowers = newUserData.followers;

//         if (newPoints > prevPoints) {
//             await nonactionNotifFunctions.userDepositNotification(event);
//         } else if (newFollowers.length > prevFollowers.length) {
//             await actionNotifFunctions.newFollowerNotification(event);
//         }
//         await algoliaKeys.ALGOLIA_USERS_INDEX.saveObject({ ...data, objectID });
//         return;
//     });

// export const deleteUserTrigger = functions
//     .firestore
//     .document('webblen_user/{user}')
//     .onDelete(async event => {
//         const objectID = event.id;
//         await algoliaKeys.ALGOLIA_USERS_INDEX.deleteObject(objectID);
//     });


// // EVENTS
// export const createWebblenEventTrigger = functions
//     .firestore
//     .document('events/{eventPost}')
//     .onCreate(async event => {
//         const data = event.data().d;
//         const objectID = event.id;
//         await eventFunctions.createWebblenEventTrigger(data);
//         await algoliaKeys.ALGOLIA_WEBLLEN_EVENTS_INDEX.addObject({ ...data, objectID });
//         return;
//         // return notificationFunctions.sendNewCommunityEventNotification(event);
//     });

// export const updateWebblenEventTrigger = functions
//     .firestore
//     .document('events/{eventPost}')
//     .onUpdate(async event => {
//         const data = event.after.data().d;
//         const objectID = data.id;
//         console.log('updating ' + objectID);
//         await eventFunctions.createWebblenEventTrigger(data);
//         await algoliaKeys.ALGOLIA_WEBLLEN_EVENTS_INDEX.saveObject({ ...data, objectID });
//         return;
//         //return notificationFunctions.sendNewCommunityEventNotification(event);
//     });

// export const deleteWebblenEventTrigger = functions
//     .firestore
//     .document('events/{eventPost}')
//     .onDelete(async event => {
//         const objectID = event.id;
//         await eventFunctions.createWebblenEventTrigger(event);
//         return algoliaKeys.ALGOLIA_WEBLLEN_EVENTS_INDEX.deleteObject(objectID);
//     });

// // export const createWebblenEventTigger = functions.firestore
// // 	.document("webblen_events/{event}")
// // 	.onCreate(async (event) => {
// // 		const data = event.data();
// //         //return algoliaWebblenEventFunctions.saveEventToSearchIndex(data);
// //         return;
// // 	});

// // export const updateWebblenEventTrigger = functions.firestore
// // 	.document("webblen_events/{event}")
// // 	.onUpdate(async (event) => {
// //         const prevData = event.before.data();
// //         const updatedData = event.after.data();

// //         if (prevData.attendees !== updatedData.attendees){
// //             //Update Payout
// //         }
// //         //return algoliaWebblenEventFunctions.saveEventToSearchIndex(data);
// //         return ;
// // 	});

// // export const deleteWebblenTrigger = functions.firestore
// // 	.document("webblen_events/{event}")
// // 	.onDelete(async (event) => {
// // 		const data = event.data();
// //         //return algoliaWebblenEventFunctions.deleteEventFromSearchIndex(data);
// //         return;
// // 	});

// // SCRAPED EVENTS
// export const createScrapedEventTrigger = functions
//     .firestore
//     .document('scraped_events/{eventPost}')
//     .onCreate(async event => {
//         const data = event.data();
//         const objectID = event.id;
//         await eventFunctions.createScrapedEventTrigger(data);
//         await algoliaKeys.ALGOLIA_WEBLLEN_EVENTS_INDEX.addObject({ ...data, objectID });
//         return;
//         //return notificationFunctions.sendNewCommunityEventNotification(event);
//     });

// export const deleteEventTrigger = functions
//     .firestore
//     .document('upcoming_events/{eventPost}')
//     .onDelete(async event => {
//         const objectID = event.id;
//         return algoliaKeys.ALGOLIA_EVENTS_INDEX.deleteObject(objectID);
//     });

// // POSTS
// export const createPostTrigger = functions
//     .firestore
//     .document('posts/{post}')
//     .onCreate(async post => {
//         const data = post.data();
//         const objectID = post.id;
//         await nonactionNotifFunctions.notifyUsersOfNewPost(data);
//         return algoliaKeys.ALGOLIA_POSTS_INDEX.addObject({ ...data, objectID });
//     });

// // CHATS
// export const updateChatTrigger = functions
//     .firestore
//     .document('chats/{chat}')
//     .onUpdate(event => {
//         return actionNotifFunctions.sendMessageReceivedNotification(event);
//     });

// // TRANSACTIONS
// export const updateTransactionTrigger = functions
//     .firestore
//     .document('transactions/{transaction}')
//     .onUpdate(event => {
//         return nonactionNotifFunctions.sendTransactionRefNotif(event);
//     });

// //COMMUNITY EVENTS
// // export const updateCommunityFollowers = functions
// // .firestore
// // .document('users/{user}'
// // .onCreate(event => {
// //     return communityFunctions.
// // });
// // export const newCommunityResponder = functions
// // .firestore
// // .document('available_locations/{area}/communities/{community}')
// // .onCreate(event => {
// //     return communityFunctions.
// // });