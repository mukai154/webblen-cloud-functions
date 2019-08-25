import * as admin from 'firebase-admin'
import * as geo from 'geofirestore'
const database = admin.firestore();
const geofirestore = new geo.GeoFirestore(database);
const userRef = admin.firestore().collection('webblen_user');
const recurringEventsRef = database.collection('recurring_events');
const upcomingEventsRef = database.collection('upcoming_events');
const upcomingEventsGeoRef = geofirestore.collection('upcoming_events');
const pastEventsRef = database.collection('past_events');
//const pastEventsGeoRef = geofirestore.collection('past_events');

//**
//**
//** 
//CREATE

//**
//**
//** 
//READ
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

export async function getEventAttendees(data: any, context: any){
    const attendees = [];
    if (data.pastOrFuture === 'past'){
        const eventDoc = await pastEventsRef.doc(data.eventID).get();
        const eventData = eventDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs){
            const userDoc = await userRef.doc(uid).get();        
            if (userDoc.exists){
                attendees.push(userDoc.data()!.d);
            }
        }
    } else {
        const eventDoc = await upcomingEventsRef.doc(data.eventID).get();
        const eventData = eventDoc.data()!.d;
        const userIDs = eventData.attendees;
        for (const uid of userIDs){
            const userDoc = await userRef.doc(uid).get();        
            if (userDoc.exists){
                attendees.push(userDoc.data()!.d);
            }
        }
    }
    return attendees;
}

// export async function getEventsFromFollowedCommunities(data: any, context: any){
//     //const events = [];
//     const uid = data.uid;
//     const userDoc = await userRef.doc(uid).get();
//     const userData = userDoc.data()!.d;
//     const communities = userData.followingCommunities;
//     const areas = communities.call(communities, (val: any) => {
//         console.log(val);
//     })
//     console.log(areas);
// }

export async function getEventsNearLocation(data: any, context: any){
    const events = [];
    const currentDateInMilliseconds = Date.now();    
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: 15}).get();    
    for (const doc of query.docs){
        if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds){
            events.push(doc.data());
        }
    }    
    return events;
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

export async function getNearbyEventsHappeningNow(data: any, context: any){
    const events = [];
    const currentDateInMilliseconds = Date.now();
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: 15}).get();
    for (const doc of query.docs){
        if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds 
            && doc.data().startDateInMilliseconds <= currentDateInMilliseconds){
            events.push(doc.data());
        }
    }
    return events;
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
    let checkInsAvailable = false;
    const currentDateInMilliseconds = Date.now();
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: 0.75}).get();
    if (query.docs.length > 0){
        for (const doc of query.docs){
            if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds 
                && doc.data().startDateInMilliseconds <= currentDateInMilliseconds){
                checkInsAvailable = true;
                break;
            }
        }
    }
    return checkInsAvailable;
}

export async function getEventsForCheckIn(data: any, context: any){
    const events = [];
    const currentDateInMilliseconds = Date.now();
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await upcomingEventsGeoRef.near({center: geoPoint, radius: 0.25})
    .get();
    for (const doc of query.docs){
        if (doc.data().endDateInMilliseconds >= currentDateInMilliseconds && doc.data().startDateInMilliseconds <= currentDateInMilliseconds){
            events.push(doc.data());
        }
    }
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
    const eventDocRef = await upcomingEventsRef.doc(data.eventID);
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
    const eventDocRef = await upcomingEventsRef.doc(data.eventID);
    const eventDoc = await eventDocRef.get();
    const eventData = eventDoc.data()!.d;
    const attendees = eventData.attendees;
    console.log('attendees: ' + attendees.toString());
    const checkoutIndex = attendees.indexOf(data.uid);
    console.log(checkoutIndex);
    attendees.splice(checkoutIndex);
    console.log('new att: ' + attendees.toString());
    
    let newEventValue = 0;
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
//**
//**
//** 
//DELETE
