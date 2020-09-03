import * as admin from 'firebase-admin';

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
    console.log('create webblen event trigger...');
    const event = data;
    console.log(event);
    const eventID = event.id;
    const eventLat = event.lat;
    const eventLon = event.lon;
    console.log(eventLat);
    console.log(eventLon);
    const eventGeoPoint = new admin.firestore.GeoPoint(eventLat, eventLon);
    await eventsRef.doc(eventID).update({
        'l': eventGeoPoint,
    });
    return;
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
//**
//**
//** 
//DELETE