import * as admin from 'firebase-admin';
import { getNearbyZipcodes, getInfoFromAddress } from '../utils/location_functions';
// import { testLab } from 'firebase-functions';

const messagingAdmin = admin.messaging();
const database = admin.firestore();

const userRef = admin.firestore().collection('webblen_user');
const eventsRef = admin.firestore().collection('events');
const recurringEventsRef = database.collection('recurring_events');
const upcomingEventsRef = database.collection('upcoming_events');
const pastEventsRef = database.collection('past_events');
//const pastEventsGeoRef = geofirestore.collection('past_events');

//**
//**
//** 
//CREATE
export async function createWebblenEventTrigger(data: any) {
    const messageTokens: any[] = [];
    const event = data;
    const eventIsStream = event.isDigitalEvent;
    const privacy = event.privacy;
    const eventID = event.id;
    const eventLat = event.lat;
    const eventLon = event.lon;
    const eventGeoPoint = new admin.firestore.GeoPoint(eventLat, eventLon);
    await eventsRef.doc(eventID).update({
        'l': eventGeoPoint,
    });

    const authorDoc = await userRef.doc(event.authorID).get();
    const authorData = authorDoc.data()!.d;
    const authorUsername = authorData.username;
    const authorFollowers = authorData.followers;

    let notificationTitle;
    if (eventIsStream) {
        notificationTitle = "@" + authorUsername + " Scheduled a New Stream";
    } else {
        notificationTitle = "@" + authorUsername + " Scheduled a New Event";
    }

    if (privacy === "public") {
        for (const follower of authorFollowers) {
            console.log(follower);
            const followerDoc = await userRef.doc(follower).get();
            if (followerDoc.exists) {
                let lastNotificationTimeInMilliseconds;
                if (followerDoc.data()!.lastNotificationTimeInMilliseconds !== undefined) {
                    lastNotificationTimeInMilliseconds = followerDoc.data()!.lastNotificationTimeInMilliseconds;
                    const currentDateInMilliseconds = new Date().getTime();
                    if (currentDateInMilliseconds - 3600000 > lastNotificationTimeInMilliseconds) {
                        const followerData = followerDoc.data()!.d;
                        const followerID = followerData.uid;
                        if (followerData.messageToken !== undefined && followerData.messageToken.length > 9) {
                            const followerToken = followerData.messageToken;
                            messageTokens.push(followerToken);
                        }
                        const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                        const notifExp = new Date().getTime() + 1209600000;
                        await admin.firestore().doc("user_notifications/" + notifKey).create({
                            messageToken: "",
                            notificationData: eventID,
                            notificationTitle: notificationTitle,
                            notificationDescription: '',
                            notificationExpirationDate: notifExp.toString(),
                            notificationExpDate: notifExp,
                            notificationKey: notifKey,
                            notificationSeen: false,
                            notificationSender: '',
                            sponsoredNotification: false,
                            notificationType: 'event',
                            uid: followerID
                        });
                        await userRef.doc(followerID).update({
                            "lastNotificationTimeInMilliseconds": currentDateInMilliseconds,
                        });
                    }
                }
            }
        }

        let notifTitle;
        if (eventIsStream) {
            notifTitle = "@" + authorUsername + " Scheduled a New Stream"
        } else {
            notifTitle = "@" + authorUsername + " Scheduled a New Event"
        }

        const payload = {
            notification: {
                title: notifTitle,
                body: event.title,
                badge: "1"
            },
            data: {
                TYPE: 'newEvent',
                DATA: eventID,
            }
        };

        await messagingAdmin.sendToDevice(messageTokens, payload).catch(function onError(error: any) {
            console.log(error);
        });;
    }

    return;
}

export async function createScrapedEventTrigger(data: any) {
    console.log('create scraped event trigger...');
    const scrapedEvent = data;

    console.log(scrapedEvent);

    const scrapedEventId = scrapedEvent.id;
    const scrapedEventCity = scrapedEvent.city;
    const scrapedEventAddress = scrapedEvent.address;
    const scrapedEventDate = scrapedEvent.date;
    const scrapedEventDesc = scrapedEvent.description;
    const scrapedEventEndTime = scrapedEvent.end_time;
    const scrapedEventImageUrl = scrapedEvent.image_url;
    const scrapedEventStartTime = scrapedEvent.start_time;
    const scrapedEventState = scrapedEvent.state;
    const scrapedEventTitle = scrapedEvent.title
    const scrapedEventUrl = scrapedEvent.url;
    const scrapedEventCategory = getEventCategoryFromDesc(scrapedEventDesc);
    const scrapedEventType = getEventTypeFromDesc(scrapedEventDesc);

    console.log(scrapedEventId);
    console.log(scrapedEventDesc);

    const locationInfo = await getInfoFromAddress(scrapedEventAddress);
    const lat = locationInfo.latitude;
    const lon = locationInfo.longitude;
    const zipcode = locationInfo.zipcode;

    const nearbyZipcodes = await getNearbyZipcodes(zipcode);

    const eventFromScrapedEventMap = {
        'id': scrapedEventId,
        'authorID': "EtKiw3gK37QsOg6tPBnSJ8MhCm23",
        'hasTickets': false,
        'flashEvent': false,
        'isDigitalEvent': false,
        'digitalEventLink': "",
        'title': scrapedEventTitle,
        'desc': scrapedEventDesc,
        'imageURL': scrapedEventImageUrl,
        'venueName': '',
        'nearbyZipcodes': nearbyZipcodes,
        'streetAddress': scrapedEventAddress,
        'city': scrapedEventCity,
        'province': scrapedEventState,
        'lat': lat,
        'lon': lon,
        'sharedComs': [],
        'tags': [],
        'type': scrapedEventType,
        'category': scrapedEventCategory,
        'clicks': 0,
        'website': scrapedEventUrl,
        'fbUsername': '',
        'instaUsername': '',
        'twitterUsername': '',
        'checkInRadius': 10.5,
        'estimatedTurnout': 0,
        'actualTurnout': 0,
        'attendees': [],
        'eventPayout': 0.0001,
        'recurrence': 'none',
        'startDateTimeInMilliseconds': getTimeFromDateInMilliseconds(scrapedEventDate, scrapedEventStartTime),
        'endDateTimeInMilliseconds': getTimeFromDateInMilliseconds(scrapedEventDate, scrapedEventEndTime),
        'startDate': scrapedEventDate,
        'endDate': scrapedEventDate,
        'startTime': scrapedEventStartTime,
        'endTime': scrapedEventEndTime,
        'timezone': 'CDT',
        'privacy': 'public',
        'reported': 'false',
        'webAppLink': `https://app.webblen.io/#/event?id=${scrapedEventId}`,
        'savedBy': [],
        'paidOut': false,

    }

    const eventGeoPoint = new admin.firestore.GeoPoint(lat, lon);

    await eventsRef.doc(scrapedEventId).create({
        'd': eventFromScrapedEventMap,
        'g': '',
        'l': eventGeoPoint,
    });
    return;
}

//**
//**
//** 
//READ
export async function getEventByKey(data: any, context: any) {
    let event = undefined;
    const eventKey = data.eventKey;
    let eventDoc = await upcomingEventsRef.doc(eventKey).get();
    if (eventDoc.exists) {
        event = eventDoc.data()!.d;
    } else {
        eventDoc = await pastEventsRef.doc(eventKey).get();
        if (eventDoc.exists) {
            event = eventDoc.data()!.d;
        }
    }
    return event
}

export async function getUserEventHistory(data: any, context: any) {
    const events = [];
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    const eventIDs = userData.eventHistory;
    for (const evID of eventIDs) {
        const eventDoc = await pastEventsRef.doc(evID).get();
        if (eventDoc.exists) {
            events.push(eventDoc.data()!.d);
        }
    }
    return events
}

export async function getCreatedEvents(data: any, context: any) {
    const events = [];
    const uid = data.uid;
    const upcomingEvQuery = await upcomingEventsRef.where("d.authorUid", "==", uid).get();
    const pastEvQuery = await pastEventsRef.where("d.authorUid", "==", uid).get();
    for (const eventDoc of upcomingEvQuery.docs) {
        events.push(eventDoc.data().d);
    }
    for (const eventDoc of pastEvQuery.docs) {
        events.push(eventDoc.data().d);
    }
    return events
}

export async function getEventsForTicketScans(data: any, context: any) {
    const events = [];
    const uid = data.uid;
    const eventQuery = await upcomingEventsRef.where("d.authorUid", "==", uid).where("d.hasTickets", "==", true).get();
    for (const eventDoc of eventQuery.docs) {
        events.push(eventDoc.data().d);
    }
    return events
}

export async function getSavedEvents(data: any, context: any) {
    const events = [];
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    if (userData.savedEvents !== undefined) {
        const savedEvents = userData.savedEvents;
        for (const eventKey of savedEvents) {
            const eventSnapshot = await upcomingEventsRef.doc(eventKey).get();
            const eventData = eventSnapshot.data()!.d;
            events.push(eventData);
        }
    }
    return events
}

export async function getEventAttendees(data: any, context: any) {
    const attendees = [];
    const presentDoc = await upcomingEventsRef.doc(data.eventID).get();
    if (presentDoc.data() !== undefined) {
        console.log(presentDoc);
        const eventData = presentDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs) {
            console.log(uid);
            const userDoc = await userRef.doc(uid).get();
            if (userDoc.exists) {
                attendees.push(userDoc.data()!.d);
            }
        }
    } else {
        const pastDoc = await pastEventsRef.doc(data.eventID).get();
        console.log(pastDoc);
        const eventData = pastDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs) {
            console.log(uid);
            const userDoc = await userRef.doc(uid).get();
            if (userDoc.exists) {
                attendees.push(userDoc.data()!.d);
            }
        }
    }
    return attendees;
}



export async function getEventsNearLocation(data: any, context: any) {
    // const events: any[] = [];
    // const currentDateInMilliseconds = Date.now();    
    // const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    // const query = await eventGeoRef.near({center: geoPoint, radius: 15}).get();    
    // for (const doc of query.docs){
    //     if (doc.data().d.endDateInMilliseconds >= currentDateInMilliseconds){
    //         events.push(doc.data());
    //     }
    // }    
    // return events;
}

export async function getExclusiveWebblenEvents(data: any, context: any) {
    const comEvents = [];
    const eventQuery = await upcomingEventsRef
        .where('d.isWebblenEvent', '==', true)
        .get();
    for (const eventDoc of eventQuery.docs) {
        console.log(eventDoc.data());
        comEvents.push(eventDoc.data().d);
    }
    console.log(comEvents);
    return comEvents;
}

// export async function getActiveEventsNearLocation(data: any, context: any){
//     const events: any[] = [];
//     const currentDateInMilliseconds = Date.now();
//     const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
//     const query = await eventGeoRef.near({center: geoPoint, radius: 5}).get();
//     for (const doc of query.docs){
//         if (doc.data().d.endDateTimeInMilliseconds >= currentDateInMilliseconds 
//             && doc.data().d.startDateTimeInMilliseconds <= currentDateInMilliseconds){
//             events.push(doc.data());
//         }
//     }
//     return events;
// }

export async function validateGeoData(event: any) {
    const eventData = event.data();
    const isScrapped = eventData.isScrapped;
    if (isScrapped) {
        const eventKey = eventData.d.eventKey;
        const eventLocation = eventData.l;
        const eventLat = eventLocation[0];
        const eventLon = eventLocation[1];
        const eventGeopoint = new admin.firestore.GeoPoint(eventLat, eventLon);
        const newEventLocData = { 'geohash': '', 'geopoint': eventGeopoint }

        await upcomingEventsRef.doc(eventKey).update({
            'd.location': newEventLocData,
            'l': eventGeopoint
        });
    }

    return;
}

export async function getUpcomingCommunityEvents(data: any, context: any) {
    const comEvents = [];
    const eventQuery = await upcomingEventsRef
        .where('d.communityAreaName', '==', data.areaName)
        .where('d.communityName', '==', data.comName)
        .get();
    for (const eventDoc of eventQuery.docs) {
        comEvents.push(eventDoc.data().d);
    }
    return comEvents;
}

export async function getRecommendedEvents(data: any, context: any) {
    const events = [];
    const uid = data.uid;
    const userQuery = await userRef.doc(uid).get();
    const userData = userQuery.data()!.d;
    const recommendedEvents = userData.recommendedEvents;
    if (recommendedEvents !== undefined && recommendedEvents.length > 0) {
        for (const eventKey of recommendedEvents) {
            const eventDoc = await upcomingEventsRef.doc(eventKey).get();
            if (eventDoc.exists) {
                events.push(eventDoc.data()!.d);
            }
        }
    } else {
        let x = 0;
        const eventQuery = await upcomingEventsRef
            .where('d.communityAreaName', '==', data.areaName)
            .get();
        for (const eventDoc of eventQuery.docs) {
            x += 1;
            if (x === 9) {
                break;
            }
            events.push(eventDoc.data().d);
        }
    }

    return events;
}

export async function getRecurringCommunityEvents(data: any, context: any) {
    const comEvents = [];
    const eventQuery = await recurringEventsRef
        .where('areaName', '==', data.areaName)
        .where('comName', '==', data.comName)
        .get();
    for (const eventDoc of eventQuery.docs) {
        console.log(eventDoc.data());
        comEvents.push(eventDoc.data());
    }
    console.log(comEvents);
    return comEvents;
}

export async function areCheckInsAvailable(data: any, context: any) {
    const checkInsAvailable = false;
    // const currentDateInMilliseconds = Date.now();
    // const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    // const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: 0.75}).get();
    // if (query.docs.length > 0){
    //     for (const doc of query.docs){
    //         if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds 
    //             && doc.data().startDateInMilliseconds <= currentDateInMilliseconds){
    //             checkInsAvailable = true;
    //             break;
    //         }
    //     }
    // }
    return checkInsAvailable;
}

export async function getEventsForCheckIn(data: any, context: any) {
    const events: any[] = [];
    // const currentDateInMilliseconds = Date.now();
    // const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    // const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: .75})
    // .get();
    // for (const doc of query.docs){
    //     if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds && doc.data().startDateInMilliseconds <= currentDateInMilliseconds){
    //         events.push(doc.data());
    //     }
    // }
    return events;
}

//**
//**
//** 
//UPDATE
export async function convertRadiusToDouble(event: any) {
    const eventData = event.data();
    console.log(eventData);

    const eventKey = eventData.eventKey;
    let website = eventData.website;
    let fbSite = eventData.fbSite;
    website = website.replace('http://www.', '');
    fbSite = fbSite.replace('http://www.', '');
    let radius = eventData.radius;
    radius = radius * 1.01;

    await recurringEventsRef.doc(eventKey).update({
        'radius': radius,
        'website': website,
        'fbSite': fbSite
    });
}

export async function updateEventViews(data: any, context: any) {
    const eventDocRef = await upcomingEventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventDocData = eventDoc.data()!.d;
    const eventViews = eventDocData.views;
    let newViewCount = eventViews + 1;
    if (newViewCount === NaN) {
        newViewCount = 1;
    }
    return eventDocRef.update({
        'd.views': newViewCount,
    });
}

export async function checkIntoEvent(data: any, context: any){
    //Get Params
    const eventID = data.uid;
    const uid = data.uid;

    //Set Check-In Time
    const checkInTimeInMilliseconds = Date.now();

    //Get Event Reference
    const eventDocRef = await eventsRef.doc(eventID);
    const eventDoc = await eventDocRef.get();

    //Get Current Event Attendees
    let attendees = eventDoc.data()!.attendees;

    //Check If User Has Already Checked-In
    for (const val of attendees){
        if (uid in val){
           return;
        } 
    }

    //If User Has NOT Checked-In, Log Check-In
    const checkIn = {
        uid: {
            'checkInTime': checkInTimeInMilliseconds,
            'checkOutTime': null,
        }
    };

    attendees.push(checkIn);

    //Update Event Attendees
    return eventDocRef.update({
        'attendees': attendees,
    });

}

export async function checkOutOfEvent(data: any, context: any){
    //Get Params
    const eventID = data.uid;
    const uid = data.uid;

    //Set Check-In Time
    const checkOutTimeInMilliseconds = Date.now();

    //Get Event Reference
    const eventDocRef = await eventsRef.doc(eventID);
    const eventDoc = await eventDocRef.get();

    //Get Current Event Attendees
    let attendees = eventDoc.data()!.attendees;

    //Check If User Has Already Checked-Out
    for (const val of attendees){
        if (uid in val){
            val['checkOutTime'] = checkOutTimeInMilliseconds;
        } 
    }

    //Update Event Attendees
    return eventDocRef.update({
        'attendees': attendees,
    });

}


export async function checkInAndUpdateEventPayout(data: any, context: any) {
    let attendees = [];
    const eventDocRef = await eventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventData = eventDoc.data()!.d;
    let eventValue = eventData.eventPayout;
    if (!eventValue || eventValue === 0) {
        eventValue = 1.00;
    }
    let userAP = data.userAP;
    if (eventData.attendees.length > 0) {
        attendees = eventData.attendees;
    }
    console.log(attendees);
    console.log('adding new attendees...');
    attendees.push(data.uid);
    const attCount = attendees.length;
    console.log('length of attendees ' + attCount.toString());
    console.log('newUserAP ' + userAP.toString());
    console.log('eventVal: ' + eventValue.toString());
    const newEventValue = (attCount * userAP) + eventValue;
    console.log('newEVent val: ' + newEventValue.toString());
    if (userAP > 0.02) {
        userAP = userAP - 0.02;
        await userRef.doc(data.uid).update({ 'd.ap': userAP });
    }
    await eventDocRef.update({ 'd.attendees': attendees, 'd.eventPayout': newEventValue });
    const newEventDoc = await eventDocRef.get();
    console.log(newEventDoc);

    return newEventDoc.data()!.d;
}

export async function checkoutAndUpdateEventPayout(data: any, context: any) {
    const eventDocRef = await eventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventData = eventDoc.data()!.d;
    const attendees = eventData.attendees;
    console.log('attendees: ' + attendees.toString());
    const checkoutIndex = attendees.indexOf(data.uid);
    console.log(checkoutIndex);
    attendees.splice(checkoutIndex);
    console.log('new att: ' + attendees.toString());

    let newEventValue = 0.0001;
    if (attendees.length > 0) {
        for (const uid of attendees) {
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!.d;
            newEventValue = (attendees.length * userData.ap) + newEventValue;
        }
    }
    await eventDocRef.update({
        'd.attendees': attendees,
        'd.eventPayout': newEventValue
    });
    const newEventDoc = await eventDocRef.get();
    return newEventDoc.data()!.d;
}

export async function fixBrokenEvents(data: any, context: any) {
    const query = await eventsRef
        .where('d.category', "==", "")
        .get();
    const docs = query.docs;
    for (const doc of docs) {
        let authorID;
        const docData = doc.data().d;
        const desc = docData.desc;
        const isDigitalEvent = false;
        if (docData.authorId !== undefined) {
            authorID = docData.authorId;
        } else {
            authorID = docData.authorID;
        }
        const category = getEventCategoryFromDesc(desc);
        await eventsRef.doc(doc.id).update({
            "d.authorID": authorID,
            "d.category": category,
            'd.isDigitalEvent': isDigitalEvent
        });
    }
    return;
}
//**
//**
//** 
//DELETE




// CRON FUNCTIONS
export async function distributeEventPoints(event: any) {
    const currentDateTime = Date.now();
    const eventSnapshots = await eventsRef
        .where('d.paidOut', '==', false)
        .where('d.endDateTimeInMilliseconds', '<=', currentDateTime)
        .get();
    for (const eventDoc of eventSnapshots.docs) {
        const eventData = eventDoc.data().d;
        const attendees = eventData.attendees;
        for (const uid of attendees) {
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!.d;
            let ap = userData.ap;
            if (ap <= 5.00) {
                ap = ap + 0.04;
            }
            const pay = 1 + (ap * attendees.length);
            const newPointVal = userData.eventPoints + pay;
            await userRef.doc(uid).update({ "d.ap": ap, "d.eventPoints": newPointVal });
        }
        await eventsRef.doc(eventDoc.id).update({ 'd.paidOut': true });
    }
}

export async function addViewsToEvents(data: any) {
    const eventQuery = await upcomingEventsRef.get();
    for (const eventDoc of eventQuery.docs) {
        const randomView = Math.floor(Math.random() * 3) + 1;
        const eventData = eventDoc.data().d;
        let eventViews = eventData.views;
        eventViews = eventViews + randomView;
        await upcomingEventsRef.doc(eventDoc.id).update({
            'd.views': eventViews
        });
    }
}

export async function setEventRecommendations(event: any) {
    //const messageTokens: any[] = [];
    // const userQuery = await userRef.get();
    // const currentDateTime = Date.now();

    // for (const userDoc of userQuery.docs){
    //     const recommendedEvents: string[] = [];
    //     const userData = userDoc.data().d;
    //     const userLat = userDoc.data().l.latitude;
    //     const userLon = userDoc.data().l.longitude;
    //     const geoPoint = new admin.firestore.GeoPoint(userLat, userLon);
    //     const eventHistoryKeys = userData.eventHistory;

    //     console.log(eventHistoryKeys);

    //     for(const eventKey of eventHistoryKeys){
    //         const eventDoc = await pastEventsRef.doc(eventKey).get();
    //         if (eventDoc.exists){
    //           const eventData = eventDoc.data()!.d;
    //           const eventEndDateInMilliseconds = eventData.endDateInMilliseconds
    //           if ((currentDateTime - eventEndDateInMilliseconds) > 0){
    //             const eventTags = eventData.tags;
    //             for (const tag of eventTags){
    //               const recommendedQuery = await upcomingEventsGeoRef.near({center: geoPoint, radius: 20}).get();
    //               for (const recEventDoc of recommendedQuery.docs){
    //                 const docID = recEventDoc.id;
    //                 if (!recommendedEvents.includes(docID) && recEventDoc.data().tags.includes(tag)){
    //                   console.log("reccomending user event: " + docID);
    //                   recommendedEvents.push(docID);
    //                 }
    //               }
    //             }
    //           }
    //         } 
    //     }

    //     await userRef.doc(userDoc.id).update({
    //       'recommendedEvents': recommendedEvents
    //     });
    return;
}


// EVENT CHECK INS
export async function setDailyCheckInsAmericaChicago(event: any) {
    let i: number;
    let h: number;
    let m: number;
    let mString: string;

    const eventSnapshots = await admin.firestore().
        collection('recurring_events')
        .where('recurrenceType', '==', 'daily')
        .where('timezone', '==', 'America/Chicago')
        .get();

    for (i = 0; i < eventSnapshots.docs.length; i++) {
        const startDateTime = new Date();
        const endDateTime = new Date();
        const recurringEventData = eventSnapshots.docs[i].data();
        const startTime = recurringEventData.startTime;
        const endTime = recurringEventData.endTime;
        const eventKey = (Math.floor(Math.random() * 99999999999999) + 1).toString();

        console.log(recurringEventData.title);


        //GET EVENT START TIME
        if (startTime.includes('AM')) {
            const hString = startTime.substring(0, 2);
            if (hString === '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            const hString = startTime.substring(0, 2);
            const h24 = parseInt(hString);
            if (hString === '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        mString = startTime.substring(startTime.indexOf(':') + 1, startTime.indexOf(':') + 3);
        m = parseInt(mString);

        startDateTime.setHours(h);
        startDateTime.setMinutes(m);
        startDateTime.setSeconds(0);

        console.log(startDateTime.getTime() + 18000000);


        //GET EVENT END TIME
        if (endTime.includes('AM')) {
            const hString = endTime.substring(0, 2);
            if (hString === '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            const hString = endTime.substring(0, 2);
            const h24 = parseInt(hString);
            if (hString === '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        mString = endTime.substring(endTime.indexOf(':') + 1, endTime.indexOf(':') + 3);
        m = parseInt(mString);

        endDateTime.setHours(h);
        endDateTime.setMinutes(m);
        endDateTime.setSeconds(0);

        console.log(endDateTime.getTime() + 18000000);
        const eventDataMap = {
            eventKey: eventKey,
            privacy: recurringEventData.privacy,
            eventType: recurringEventData.eventType,
            location: recurringEventData.location,
            address: recurringEventData.address,
            authorUid: recurringEventData.authorUid,
            communityName: recurringEventData.comName,
            communityAreaName: recurringEventData.areaName,
            imageURL: recurringEventData.imageURL,
            title: recurringEventData.title,
            description: recurringEventData.description,
            recurrence: 'none',
            promoted: false,
            radius: recurringEventData.radius + 0.01,
            tags: recurringEventData.tags,
            views: 0,
            estimatedTurnout: 0,
            actualTurnout: 0,
            fbSite: recurringEventData.fbSite,
            twitterSite: recurringEventData.twitterSite,
            website: recurringEventData.website,
            eventPayout: 0.00,
            pointsDistributedToUsers: false,
            attendees: [],
            costToAttend: null,
            flashEvent: false,
            startDateInMilliseconds: startDateTime.getTime() + 18000000,
            endDateInMilliseconds: endDateTime.getTime() + 18000000,
        }

        const eventGeohash = recurringEventData.location['geohash'];
        const eventLoc = recurringEventData.location['geopoint'];

        await upcomingEventsRef.doc(eventKey).set({
            'd': eventDataMap,
            'g': eventGeohash,
            'l': eventLoc
        });
    }
}

export async function setWeeklyCheckInsAmericaChicago(event: any) {
    let i: number;
    let h: number;
    let m: number;
    let dayIndex: number;
    let mString: string;

    const eventSnapshots = await admin.firestore().
        collection('recurring_events')
        .where('recurrenceType', '==', 'weekly')
        .where('timezone', '==', 'America/Chicago')
        .get();

    for (i = 0; i < eventSnapshots.docs.length; i++) {
        const recurringEventData = eventSnapshots.docs[i].data();
        const millisecondsPerDay = 86470000;
        const timezoneDifferenceInMilliseconds = 18000000;
        const dayOfTheWeek = recurringEventData.dayOfTheWeek;
        const startTime = recurringEventData.startTime;
        const endTime = recurringEventData.endTime;
        const eventKey = (Math.floor(Math.random() * 99999999999999) + 1).toString();

        //Get Day of The Week      
        if (dayOfTheWeek === 'Sunday') {
            dayIndex = 0;
        } else if (dayOfTheWeek === 'Monday') {
            dayIndex = 1;
        } else if (dayOfTheWeek === 'Tuesday') {
            dayIndex = 2;
        } else if (dayOfTheWeek === 'Wednesday') {
            dayIndex = 3;
        } else if (dayOfTheWeek === 'Thursday') {
            dayIndex = 4;
        } else if (dayOfTheWeek === 'Friday') {
            dayIndex = 5;
        } else {
            dayIndex = 6;
        }

        const startingDayInMilliseconds = new Date().getTime();
        const dayInMilliseconds = (millisecondsPerDay * dayIndex) + startingDayInMilliseconds;
        //GET EVENT START DATE & TIME
        const startDate = new Date(dayInMilliseconds);
        //Set hour
        if (startTime.includes('AM')) {
            const hString = startTime.substring(0, 2);
            if (hString === '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            const hString = startTime.substring(0, 2);
            const h24 = parseInt(hString);
            if (hString === '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        startDate.setHours(h);

        // Set Minutes
        mString = startTime.substring(startTime.indexOf(':') + 1, startTime.indexOf(':') + 3);
        m = parseInt(mString);
        if (m <= 6) {
            m = 0;
        } else if (m <= 20) {
            m = 15;
        } else if (m <= 40) {
            m = 30;
        } else {
            m = 45;
        }
        startDate.setMinutes(m);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        const startDateInMilliseconds = startDate.getTime() + timezoneDifferenceInMilliseconds;

        //GET EVENT END TIME
        const endDate = new Date(dayInMilliseconds);
        //Set hours
        if (endTime.includes('AM')) {
            const hString = endTime.substring(0, 2);
            if (hString === '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            const hString = endTime.substring(0, 2);
            const h24 = parseInt(hString);
            if (hString === '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        endDate.setHours(h);
        mString = endTime.substring(endTime.indexOf(':') + 1, endTime.indexOf(':') + 3);
        m = parseInt(mString);
        if (m <= 6) {
            m = 0;
        } else if (m <= 20) {
            m = 15;
        } else if (m <= 40) {
            m = 30;
        } else {
            m = 45;
        }
        endDate.setMinutes(m);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);

        const endDateInMilliseconds = endDate.getTime() + timezoneDifferenceInMilliseconds;

        const eventDataMap = {
            eventKey: eventKey,
            location: recurringEventData.location,
            address: recurringEventData.address,
            privacy: recurringEventData.privacy,
            eventType: recurringEventData.eventType,
            authorUid: recurringEventData.authorUid,
            communityName: recurringEventData.comName,
            communityAreaName: recurringEventData.areaName,
            imageURL: recurringEventData.imageURL,
            title: recurringEventData.title,
            description: recurringEventData.description,
            recurrence: 'none',
            promoted: false,
            radius: recurringEventData.radius + 0.01,
            tags: recurringEventData.tags,
            views: 0,
            estimatedTurnout: 0,
            actualTurnout: 0,
            fbSite: recurringEventData.fbSite,
            twitterSite: recurringEventData.twitterSite,
            website: recurringEventData.website,
            eventPayout: 0.00,
            pointsDistributedToUsers: false,
            attendees: [],
            costToAttend: null,
            flashEvent: false,
            startDateInMilliseconds: startDateInMilliseconds,
            endDateInMilliseconds: endDateInMilliseconds,
        }

        const eventGeohash = recurringEventData.location['geohash'];
        const eventLoc = recurringEventData.location['geopoint'];

        await upcomingEventsRef.doc(eventKey).set({
            'd': eventDataMap,
            'g': eventGeohash,
            'l': eventLoc
        });
    }
}

export async function setMonthlyCheckInsAmericaChicago(event: any) {
    var i: number;
    var h: number;
    var m: number;
    var mString: string;

    const eventSnapshots = await admin.firestore().
        collection('recurring_events')
        .where('recurrenceType', '==', 'daily')
        .where('timezone', '==', 'America/Chicago')
        .get();

    for (i = 0; i < eventSnapshots.docs.length; i++) {
        let startDateTime = new Date();
        let endDateTime = new Date();
        let recurringEventData = eventSnapshots.docs[i].data();
        let startTime = recurringEventData.startTime;
        let endTime = recurringEventData.endTime;
        let eventKey = (Math.floor(Math.random() * 99999999999999) + 1).toString();

        console.log(recurringEventData.title);


        //GET EVENT START TIME
        if (startTime.includes('AM')) {
            let hString = startTime.substring(0, 2);
            if (hString == '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            let hString = startTime.substring(0, 2);
            let h24 = parseInt(hString);
            if (hString == '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        mString = startTime.substring(startTime.indexOf(':') + 1, startTime.indexOf(':') + 3);
        m = parseInt(mString);

        startDateTime.setHours(h);
        startDateTime.setMinutes(m);
        startDateTime.setSeconds(0);

        console.log(startDateTime.getTime() + 18000000);


        //GET EVENT END TIME
        if (endTime.includes('AM')) {
            let hString = endTime.substring(0, 2);
            if (hString == '12') {
                h = 0;
            } else {
                h = parseInt(hString);
            }
        } else {
            let hString = endTime.substring(0, 2);
            let h24 = parseInt(hString);
            if (hString == '12') {
                h = 12;
            } else {
                h = 12 + h24;
            }
        }
        mString = endTime.substring(endTime.indexOf(':') + 1, endTime.indexOf(':') + 3);
        m = parseInt(mString);

        endDateTime.setHours(h);
        endDateTime.setMinutes(m);
        endDateTime.setSeconds(0);

        console.log(endDateTime.getTime() + 18000000);

        await admin.firestore().doc("events/" + eventKey).create({
            eventKey: eventKey,
            location: recurringEventData.location,
            address: recurringEventData.address,
            authorUid: recurringEventData.authorUid,
            communityName: recurringEventData.comName,
            communityAreaName: recurringEventData.areaName,
            imageURL: recurringEventData.imageURL,
            title: recurringEventData.title,
            description: recurringEventData.description,
            recurrence: 'none',
            promoted: false,
            radius: recurringEventData.radius,
            tags: recurringEventData.tags,
            views: 0,
            estimatedTurnout: 0,
            actualTurnout: 0,
            fbSite: recurringEventData.fbSite,
            twitterSite: recurringEventData.twitterSite,
            website: recurringEventData.website,
            eventPayout: 0.00,
            pointsDistributedToUsers: false,
            attendees: [],
            costToAttend: null,
            flashEvent: false,
            startDateInMilliseconds: startDateTime.getTime() + 18000000,
            endDateInMilliseconds: endDateTime.getTime() + 18000000,
        });
    }
}

// export async function scheduleRecurringEvent(event: any) {
//     const recurringEventData = event.data();
//     const recurrenceType = recurringEventData.recurrenceType;
//     const eventID = (Math.floor(Math.random() * 9999999999) + 1).toString();












//     const payload = {
//         notification: {
//             title: "New Reccomendations Available!",
//             body: "We have a new set of events we think you'll like 😍",
//             badge: "1",
//         },
//         data: {
//             "TYPE": "",
//             "DATA": ""
//         }
//     };

//     await messagingAdmin.sendToDevice(messageToken, payload);

//     const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
//     const notifExp = new Date().getTime() + 1209600000;
//     return admin.firestore().doc("user_notifications/" + notifKey).create({
//         messageToken: messageToken,
//         notificationData: "",
//         notificationTitle: "New Deposit!",
//         notificationDescription: pointDifference + " webblen has been deposited in your wallet",
//         notificationExpirationDate: notifExp.toString(),
//         notificationExpDate: notifExp,
//         notificationKey: notifKey,
//         notificationSeen: false,
//         notificationSender: '',
//         sponsoredNotification: false,
//         notificationType: 'deposit',
//         uid: newUserData.uid
//     });
// }
