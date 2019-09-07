import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp(functions.config().firebase);

import * as userFunctions from './user_functions/crud'
import * as scheduleUserFunctions from './scheduled_user_functions/index'
import * as eventFunctions from './event_functions/crud'
import * as communityFunctions from './community_functions/crud'
import * as adFunctions from './ad_functions/crud'
import * as newPostFunctions from './news_post_functions/crud'
import * as notificationFunctions from './remote_notif_functions/index'
import * as notifActionFunctions from './notif_action_functions/index'
import * as jobFunctions from './scheduled_event_functions/index'

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


export const getNearbyUsers = functions.https.onCall((data, context) => {
    return userFunctions.getNearbyUsers(data, context);
});

export const getNumberOfNearbyUsers = functions.https.onCall((data, context) => {
    return userFunctions.getNumberOfNearbyUsers(data, context);
});

export const get10RandomUsers = functions.https.onCall((data, context) => {
    return userFunctions.get10RandomUsers(data, context);
});

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
export const getUserEventHistory = functions.https.onCall((data, context) => {
    return eventFunctions.getUserEventHistory(data, context);
});


export const getEventAttendees = functions.https.onCall((data, context) => {
    return eventFunctions.getEventAttendees(data, context);
});

export const getEventsNearLocation = functions.https.onCall((data, context) => {
    return eventFunctions.getEventsNearLocation(data, context);
});

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

//** communities */
export const checkIfCommunityExists = functions.https.onCall((data, context) => {
    return communityFunctions.checkIfCommunityExists(data, context);
});

export const getCommunityByName = functions.https.onCall((data, context) => {
    return communityFunctions.getCommunityByName(data, context);
});

export const getUserCommunities = functions.https.onCall((data, context) => {
    return communityFunctions.getUserCommunities(data, context);
});

export const getNearbyCommunities = functions.https.onCall((data, context) => {
    return communityFunctions.getNearbyCommunities(data, context);
});

export const inviteUsersToCommunity = functions.https.onCall((data, context) => {
    return communityFunctions.inviteUsersToCommunity(data, context);
});

export const removeInvitedUserFromCommunity = functions.https.onCall((data, context) => {
    return communityFunctions.removeInvitedUserFromCommunity(data, context);
});

export const updateCommunityFollowers = functions.https.onCall((data, context) => {
    return communityFunctions.updateCommunityFollowers(data, context);
});

export const updateCommunityMembers = functions.https.onCall((data, context) => {
    return communityFunctions.updateCommunityMembers(data, context);
});

export const leaveCommunity = functions.https.onCall((data, context) => {
    return communityFunctions.leaveCommunity(data, context);
});

//** news posts */
export const getCommunityNewsPosts = functions.https.onCall((data, context) => {
    return newPostFunctions.getCommunityNewsPosts(data, context);
});

export const getUserNewsPostFeed = functions.https.onCall((data, context) => {
    return newPostFunctions.getUserNewsPostFeed(data, context);
});

//** ads */
export const getNearbyAds = functions.https.onCall((data, context) => {
    return adFunctions.getNearbyAds(data, context);
});


//** notif actions */
export const acceptCommunityInvite = functions.https.onCall((data, context) => {
    return notifActionFunctions.acceptCommunityInvite(data, context);
});

export const acceptFriendRequest = functions.https.onCall((data, context) => {
    return notifActionFunctions.acceptFriendRequest(data, context);
});

export const denyFriendRequest = functions.https.onCall((data, context) => {
    return notifActionFunctions.denyFriendRequest(data, context);
});

//**
//**
//** 
//NOTIFICATION EVENTS
export const sendUserNotification = functions
.firestore
.document('user_notifications/{notif}')
.onCreate(event => {
 return notificationFunctions.sendUserNotification(event);
});

export const sendUserDepositNotification = functions
.firestore
.document('webblen_user/{user}')
.onUpdate(event => {
 return notificationFunctions.userDepositNotification(event);
});

export const sendCommunityNewsPostNotification = functions
.firestore
.document('community_news/{post}')
.onCreate(event => {
 return notificationFunctions.sendNewCommunityPostNotif(event);
});

export const sendCommunityPostCommentNotification = functions
.firestore
.document('comments/{comment}')
.onCreate(event => {
 return notificationFunctions.sendCommunityPostCommentNotification(event);
});

export const sendNewCommunityEventNotification = functions
.firestore
.document('events/{eventPost}')
.onCreate(event => {
 return notificationFunctions.sendNewCommunityEventNotification(event);
});

export const sendMessageReceivedNotification = functions
.firestore
.document('chats/{channel}')
.onUpdate(event => {
 return notificationFunctions.sendMessageReceivedNotification(event);
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

export const distrubeEventPoints = functions
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