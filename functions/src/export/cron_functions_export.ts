//Firebase Imports
import * as functions from "firebase-functions";

//Custom Imports
import * as webblenFunctions from "../cloud_functions/webblen_functions";
import * as eventFunctions from "../cloud_functions/event_functions";
import * as postFunctions from "../cloud_functions/post_functions";
import * as nonactionNotifFunctions from "../cloud_functions/notification_functions/nonaction_notif_functions";

// PAYOUT FUNCTIONS
export const distributeEventPay = functions
    .pubsub
    .schedule('every 2 hours')
    .timeZone('America/Chicago')
    .onRun(event => {
        return webblenFunctions.distributeEventPay(event);
    });

export const rechargeUserAP = functions
    .pubsub
    .schedule('every 3 hours')
    .timeZone('America/Chicago')
    .onRun(event => {
        return webblenFunctions.distributeEventPay(event);
    });

// DAILY CHECK INS
export const setDailyCheckInsAmerciaChicago = functions
    .pubsub
    .schedule('every day 08:00')
    .timeZone('America/Chicago')
    .onRun(event => {
        return eventFunctions.setDailyCheckInsAmericaChicago(event);
    });

export const setWeeklyCheckInsAmerciaChicago = functions
    .pubsub
    .schedule('every sun 08:00')
    .timeZone('America/Chicago')
    .onRun(event => {
        return eventFunctions.setWeeklyCheckInsAmericaChicago(event);
    });

// EVENTS    
export const distributeEventPoints = functions
    .pubsub
    .schedule('every 3 hours')
    .timeZone('America/Chicago')
    .onRun(event => {

        return eventFunctions.distributeEventPoints(event);
    });

export const addViewsToEvents = functions
    .pubsub
    .schedule('every 8 hours')
    .timeZone('America/Chicago')
    .onRun(event => {
        return eventFunctions.addViewsToEvents(event);
    });

export const setEventRecommendations = functions
    .pubsub
    .schedule('every 1 minutes')
    .timeZone('America/Chicago')
    .onRun(event => {
        return eventFunctions.setEventRecommendations(event);
    });

// POSTS
export const distributePostPoints = functions
    .pubsub
    .schedule('every 2 hours')
    .timeZone('America/Chicago')
    .onRun(event => {

        return postFunctions.distributePostPoints(event);
    });

// NOTIFICATIONS    
export const sendNotifForNoonAppOpens = functions
    .pubsub
    .schedule('every day 13:30')
    .timeZone('America/Chicago')
    .onRun(event => {
        return nonactionNotifFunctions.sendDailyNotification(event);
    });

export const sendNotifEveningAppOpens = functions
    .pubsub
    .schedule('every day 18:00')
    .timeZone('America/Chicago')
    .onRun(event => {
        return nonactionNotifFunctions.sendDailyEveningNotification(event);
    });

export const deleteOldNotifications = functions
    .pubsub
    .schedule('every day 08:00')
    .timeZone('America/Chicago')
    .onRun(event => {
        return nonactionNotifFunctions.deleteOldNotifications(event);
    });

// export const scrapeMidwestEvents = functions
// .pubsub    
// .schedule('every 2 minutes')
// .timeZone('America/Chicago')
// .onRun(event => {
//     return eventScrapeFunctions.scrapeEventsInMidwest(event);
// });