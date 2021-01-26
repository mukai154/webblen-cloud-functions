import * as admin from 'firebase-admin';
import { getNearbyZipcodes, getInfoFromAddress } from '../location_functions';
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
export async function createWebblenEventTrigger(data: any){
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
    if (eventIsStream){
        notificationTitle = "@" + authorUsername + " Scheduled a New Stream";
    } else {
        notificationTitle = "@" + authorUsername + " Scheduled a New Event";
    }

    if (privacy === "public"){
        for (const follower of authorFollowers){
            console.log(follower);
            const followerDoc = await userRef.doc(follower).get();
            if (followerDoc.exists){
                let lastNotificationTimeInMilliseconds;
                if (followerDoc.data()!.lastNotificationTimeInMilliseconds !== undefined){
                    lastNotificationTimeInMilliseconds = followerDoc.data()!.lastNotificationTimeInMilliseconds;
                    const currentDateInMilliseconds = new Date().getTime();
                    if (currentDateInMilliseconds - 3600000 > lastNotificationTimeInMilliseconds){
                        const followerData = followerDoc.data()!.d;
                        const followerID = followerData.uid;
                        if (followerData.messageToken !== undefined && followerData.messageToken.length > 9){
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
        if (eventIsStream){
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
    
        await messagingAdmin.sendToDevice(messageTokens, payload).catch(function onError(error:any) {
            console.log(error);
          });;
    }

    return;
}

function getMonthNum(month: string): number {
    if (month === 'Jan' || month === 'January') {
      return 0;
    } else if (month === 'Feb' || month === 'February') {
      return 1;
    } else if (month === 'Mar' || month === 'March') {
      return 2;
    } else if (month === 'Apr' || month === 'April') {
      return 3;
    } else if (month === 'May') {
      return 4;
    } else if (month === 'Jun' || month === 'June') {
      return 5;
    } else if (month === 'Jul' || month === 'July') {
      return 6;
    } else if (month === 'Aug' || month === 'August') {
      return 7;
    } else if (month === 'Sep' || month === 'Sept' ||  month === 'September') {
      return 8;
    } else if (month === 'Oct' || month === 'October') {
      return 9;
    } else if (month === 'Nov' || month === 'November') {
      return 10;
    } else if (month === 'Dec' || month === 'December') {
      return 11;
    } else {
      return 0;
    }
  }

function getTimeFromDateInMilliseconds(startDate: string, startTime: String) {
    const splitDate = startDate.split(/[ ,]+/);
  
    const newDate = new Date();
  
    const splitTime = startTime.split(/[: ]+/);

    let h = Number(splitTime[0]);
    if (h === 12 && (splitTime[2] === 'AM' || splitTime[2] === 'am')) {
      h = 0;
    } else if (h === 12 && (splitTime[2] === 'PM' || splitTime[2] === 'pm')) {
      h = 12;
    } else if (splitTime[2] === 'PM' || splitTime[2] === 'pm') {
      h += 12;
    } else {
      h = h;
    }
  
    const m = Number(splitTime[1]);
    
    if (splitDate.length === 4) {
      newDate.setDate(Number(splitDate[2]));
      newDate.setMonth(getMonthNum(splitDate[1]));
      newDate.setFullYear(Number(splitDate[3]));
    }
    if (splitDate.length === 3) {
      newDate.setDate(Number(splitDate[1]));
      newDate.setMonth(getMonthNum(splitDate[0]));
      newDate.setFullYear(Number(splitDate[2]));
    }
    
    newDate.setHours((h - 5), m, 0, 0);
  
    return newDate.getTime();
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

function getEventCategoryFromDesc(eventDesc: string) {
    let category = "";
    const lowercaseDesc = eventDesc.toLowerCase();
    if (lowercaseDesc.includes("car") || lowercaseDesc.includes("boat") || lowercaseDesc.includes("airplane")){
        category = "Auto, Boat, & Air";
    }
    if (lowercaseDesc.includes("business") || lowercaseDesc.includes("professional") || lowercaseDesc.includes("career") || lowercaseDesc.includes("personal development")){
        category = "Business/Professional";
    }
    if (lowercaseDesc.includes("charity") || lowercaseDesc.includes("donate") || lowercaseDesc.includes("donation")){
        category = "Charity/Causes";
    }
    if (lowercaseDesc.includes("family") || lowercaseDesc.includes("child") || lowercaseDesc.includes("kid")){
        category = "Family & Education";
    }
    if (lowercaseDesc.includes("fashion") || lowercaseDesc.includes("beauty") || lowercaseDesc.includes("modeling")){
        category = "Fashion & Beauty";
    }
    if (lowercaseDesc.includes("film") || lowercaseDesc.includes("movie") || lowercaseDesc.includes("media")){
        category = "Film, Media, & Entertainment";
    }
    if (lowercaseDesc.includes("food") || lowercaseDesc.includes("drink") || lowercaseDesc.includes("meal") || lowercaseDesc.includes("dinner") || lowercaseDesc.includes("lunch") || lowercaseDesc.includes("breakfast")){
        category = "Food/Drink";
    }
    if (lowercaseDesc.includes("government") || lowercaseDesc.includes("politic") || lowercaseDesc.includes("election")){
        category = "Government/Politics";
    }
    if (lowercaseDesc.includes("health") || lowercaseDesc.includes("wellness")){
        category = "Health & Wellness";
    }
    if (lowercaseDesc.includes("lifestyle") || lowercaseDesc.includes("furniture") || lowercaseDesc.includes("home decor")){
        category = "Home/Lifestyle";
    }
    if (lowercaseDesc.includes("music") || lowercaseDesc.includes("concert") || lowercaseDesc.includes("performance")){
        category = "Music";
    }
    if (lowercaseDesc.includes("religion") || lowercaseDesc.includes("religious")){
        category = "Religion/Spirituality";
    }
    if (lowercaseDesc.includes("school")){
        category = "School Activities";
    }
    if (lowercaseDesc.includes("science") || lowercaseDesc.includes("tech")){
        category = "Science/Technology";
    }
    if (lowercaseDesc.includes("christmas") || lowercaseDesc.includes("thanksgiving") || lowercaseDesc.includes("halloween") || lowercaseDesc.includes('holiday') || lowercaseDesc.includes("seasonal")){
        category = "Seasonal/Holiday";
    }
    if (lowercaseDesc.includes("sports") || lowercaseDesc.includes("competition") || lowercaseDesc.includes("championship")){
        category = "Sports/Fitness";
    }
    if (lowercaseDesc.includes("theatre") || lowercaseDesc.includes("visual arts") || lowercaseDesc.includes("exhibit")){
        category = "Theatre/Visual Arts";
    }
    if (lowercaseDesc.includes("travel") || lowercaseDesc.includes("outdoor") || lowercaseDesc.includes("hiking") || lowercaseDesc.includes("running") || lowercaseDesc.includes("biking")){
        category = "Travel/Outdoor";
    }
    if (category === ""){
        category = "Hobbies/Special Interests";
    }
    return category;
}

function getEventTypeFromDesc(eventDesc: string) {
    let type = "";
    const lowercaseDesc = eventDesc.toLowerCase();
    if (lowercaseDesc.includes("appearance") || lowercaseDesc.includes("signing")){
        type = "Appearance/Signing";
    }
    if (lowercaseDesc.includes("festival") || lowercaseDesc.includes("attraction") || lowercaseDesc.includes("carnival") || lowercaseDesc.includes("fair")){
        type = "Festival/Fair";
    }
    if (lowercaseDesc.includes("camp") || lowercaseDesc.includes("trip") || lowercaseDesc.includes("retreat")){
        type = "Camp, Trip, or Retreat";
    }
    if (lowercaseDesc.includes("class") || lowercaseDesc.includes("workshop") || lowercaseDesc.includes("training")){
        type = "Class, Training, or Workship";
    }
    if (lowercaseDesc.includes("concert") || lowercaseDesc.includes("performance")){
        type = "Concert/Performance";
    }
    if (lowercaseDesc.includes("conference")){
        type = "Conference";
    }
    if (lowercaseDesc.includes("food") || lowercaseDesc.includes("drink") || lowercaseDesc.includes("meal") || lowercaseDesc.includes("dinner") || lowercaseDesc.includes("lunch") || lowercaseDesc.includes("breakfast")){
        type = "Dinner/Gala";
    }
    if (lowercaseDesc.includes("gaming") || lowercaseDesc.includes("e-sports") || lowercaseDesc.includes("gaming tournament")){
        type = "E-Sports Tournament";
    }
    if (lowercaseDesc.includes("network") || lowercaseDesc.includes("networking")){
        type = "Networking Event";
    }
    if (lowercaseDesc.includes("party") || lowercaseDesc.includes("meetup") || lowercaseDesc.includes("get together")){
        type = "Party/Social Gathering";
    }
    if (lowercaseDesc.includes("race") || lowercaseDesc.includes("endurance") || lowercaseDesc.includes("marathon")){
        type = "Race/Endurance Event";
    }
    if (lowercaseDesc.includes("rally")){
        type = "Rally";
    }
    if (lowercaseDesc.includes("screening")){
        type = "Screening";
    }
    if (lowercaseDesc.includes("seminar")){
        type = "Seminar/Talk";
    }
    if (lowercaseDesc.includes("tour")){
        type = "Tour";
    }
    if (lowercaseDesc.includes("tournament")){
        type = "Tournament";
    }
    if (lowercaseDesc.includes("trade show") || lowercaseDesc.includes("tradeshow") || lowercaseDesc.includes("expo")){
        type = "Tradeshow/Expo";
    }
    if (type === ""){
        type = "Other";
    }
    return type;
}

//**
//**
//** 
//READ
export async function getEventByKey(data: any, context: any){
    let event = undefined;
    const eventKey = data.eventKey;
    let eventDoc = await upcomingEventsRef.doc(eventKey).get();
    if (eventDoc.exists){
        event = eventDoc.data()!.d;
    } else {
        eventDoc = await pastEventsRef.doc(eventKey).get();
        if (eventDoc.exists){
            event = eventDoc.data()!.d;
        }
    }
    return event
}

export async function getUserEventHistory(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    const eventIDs = userData.eventHistory;
    for (const evID of eventIDs){
        const eventDoc = await pastEventsRef.doc(evID).get();
        if (eventDoc.exists){
            events.push(eventDoc.data()!.d);
        }
    }
    return events
}

export async function getCreatedEvents(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const upcomingEvQuery = await upcomingEventsRef.where("d.authorUid", "==", uid).get();
    const pastEvQuery = await pastEventsRef.where("d.authorUid", "==", uid).get();
    for (const eventDoc of upcomingEvQuery.docs){
        events.push(eventDoc.data().d);
    }
    for (const eventDoc of pastEvQuery.docs){
        events.push(eventDoc.data().d);
    }
    return events
}

export async function getEventsForTicketScans(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const eventQuery = await upcomingEventsRef.where("d.authorUid", "==", uid).where("d.hasTickets", "==", true).get();
    for (const eventDoc of eventQuery.docs){
        events.push(eventDoc.data().d);
    }
    return events
}

export async function getSavedEvents(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    if (userData.savedEvents !== undefined){
        const savedEvents = userData.savedEvents;
        for (const eventKey of savedEvents){
           const eventSnapshot = await upcomingEventsRef.doc(eventKey).get();
           const eventData = eventSnapshot.data()!.d; 
           events.push(eventData);
        }
    }
    return events
}

export async function getEventAttendees(data: any, context: any){
    const attendees = [];
    const presentDoc = await upcomingEventsRef.doc(data.eventID).get();
    if (presentDoc.data() !== undefined){
        console.log(presentDoc);
        const eventData = presentDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs){
            console.log(uid);
            const userDoc = await userRef.doc(uid).get();        
            if (userDoc.exists){
                attendees.push(userDoc.data()!.d);
            }
        }
    } else {
        const pastDoc = await pastEventsRef.doc(data.eventID).get();
        console.log(pastDoc);
        const eventData = pastDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs){
            console.log(uid);
            const userDoc = await userRef.doc(uid).get();        
            if (userDoc.exists){
                attendees.push(userDoc.data()!.d);
            }
        }
    }
    return attendees;
}

export async function addViewsToEvents(data: any){
    const eventQuery = await upcomingEventsRef.get();
    for (const eventDoc of eventQuery.docs){
        const randomView = Math.floor(Math.random() * 3) + 1;
        const eventData = eventDoc.data().d;
        let eventViews = eventData.views;
        eventViews = eventViews + randomView;
        await upcomingEventsRef.doc(eventDoc.id).update({
            'd.views': eventViews
        });
    }
}

export async function getEventsNearLocation(data: any, context: any){
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

export async function getExclusiveWebblenEvents(data: any, context: any){
    const comEvents = [];
    const eventQuery = await upcomingEventsRef
    .where('d.isWebblenEvent', '==', true)
    .get();
    for (const eventDoc of eventQuery.docs){
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

export async function validateGeoData(event: any){
    const eventData = event.data();
    const isScrapped = eventData.isScrapped;
    if (isScrapped){
        const eventKey = eventData.d.eventKey;
        const eventLocation = eventData.l;
        const eventLat = eventLocation[0];
        const eventLon = eventLocation[1];
        const eventGeopoint = new admin.firestore.GeoPoint(eventLat, eventLon);
        const newEventLocData = {'geohash': '', 'geopoint': eventGeopoint}
        
        await upcomingEventsRef.doc(eventKey).update({
            'd.location': newEventLocData,
            'l': eventGeopoint
        });
    }
    
    return;
}

export async function getUpcomingCommunityEvents(data: any, context: any){
    const comEvents = [];
    const eventQuery = await upcomingEventsRef
    .where('d.communityAreaName', '==', data.areaName)
    .where('d.communityName', '==', data.comName)
    .get();
    for (const eventDoc of eventQuery.docs){
        comEvents.push(eventDoc.data().d);
    }
    return comEvents;
}

export async function getRecommendedEvents(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const userQuery = await userRef.doc(uid).get();
    const userData = userQuery.data()!.d;
    const recommendedEvents = userData.recommendedEvents;
    if (recommendedEvents !== undefined && recommendedEvents.length > 0){
        for (const eventKey of recommendedEvents){
         const eventDoc = await upcomingEventsRef.doc(eventKey).get();  
         if (eventDoc.exists){
            events.push(eventDoc.data()!.d); 
         }
        }
    } else {
        let x = 0;
        const eventQuery = await upcomingEventsRef
        .where('d.communityAreaName', '==', data.areaName)
        .get();
        for (const eventDoc of eventQuery.docs){
            x += 1;
            if (x === 9){
                break;
            }
            events.push(eventDoc.data().d);
        }
    }

    return events;
}

export async function getRecurringCommunityEvents(data: any, context: any){
    const comEvents = [];
    const eventQuery = await recurringEventsRef
    .where('areaName', '==', data.areaName)
    .where('comName', '==', data.comName)
    .get();
    for (const eventDoc of eventQuery.docs){
        console.log(eventDoc.data());
        comEvents.push(eventDoc.data());
    }
    console.log(comEvents);
    return comEvents;
}

export async function areCheckInsAvailable(data: any, context: any){
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

export async function getEventsForCheckIn(data: any, context: any){
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
export async function convertRadiusToDouble(event: any){
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

export async function updateEventViews(data: any, context: any){
    const eventDocRef = await upcomingEventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventDocData = eventDoc.data()!.d;
    const eventViews = eventDocData.views;
    let newViewCount = eventViews + 1;
    if (newViewCount === NaN){
        newViewCount = 1;
    }
    return eventDocRef.update({
        'd.views': newViewCount,
    });
}

export async function checkInAndUpdateEventPayout(data: any, context: any){
    let attendees = [];
    const eventDocRef = await eventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventData = eventDoc.data()!.d;
    let eventValue = eventData.eventPayout;
    if (!eventValue || eventValue === 0){
        eventValue = 1.00;
    }
    let userAP = data.userAP;
    if (eventData.attendees.length > 0){
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
    if (userAP > 0.02){
        userAP = userAP - 0.02;
        await userRef.doc(data.uid).update({'d.ap': userAP});
    }
    await eventDocRef.update({'d.attendees': attendees,'d.eventPayout': newEventValue});
    const newEventDoc = await eventDocRef.get();
    console.log(newEventDoc);
    
    return newEventDoc.data()!.d;
}

export async function checkoutAndUpdateEventPayout(data: any, context: any){
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
    if (attendees.length > 0){
        for (const uid of attendees){
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!.d;
            newEventValue =  (attendees.length * userData.ap) + newEventValue; 
        }
    }
    await eventDocRef.update({
        'd.attendees': attendees,
        'd.eventPayout': newEventValue
    });
    const newEventDoc= await eventDocRef.get();
    return newEventDoc.data()!.d;
}

export async function fixBrokenEvents(data: any, context: any){
    const query = await eventsRef
    .where('d.category', "==", "")
    .get();
    const docs = query.docs;
    for (const doc of docs){
        let authorID;
        const docData = doc.data().d;
        const desc = docData.desc;
        const isDigitalEvent = false;
        if (docData.authorId !== undefined){
            authorID = docData.authorId;
        } else {
            authorID = docData.authorID;
        }
        const category =  getEventCategoryFromDesc(desc);
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