import * as admin from 'firebase-admin'
import * as geo from 'geofirestore'

const database = admin.firestore();
const geofirestore = new geo.GeoFirestore(database);
const userRef = admin.firestore().collection('webblen_user');
//const recurringEventsRef = database.collection('recurring_events');
const upcomingEventsRef = database.collection('upcoming_events');
const upcomingEventsGeoRef = geofirestore.collection('upcoming_events');
const pastEventsRef = database.collection('past_events');
//const userCalendarRef = database.collection('user_calendars');
//const pastEventsGeoRef = geofirestore.collection('past_events');

export async function setDailyCheckInsAmericaChicago(event: any){
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
        if (startTime.includes('AM')){
          const hString = startTime.substring(0,2);
            if (hString === '12'){
              h = 0;
            } else {
              h = parseInt(hString);
            }
        } else {
          const hString = startTime.substring(0,2);
          const h24 = parseInt(hString);
            if (hString === '12'){
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
        if (endTime.includes('AM')){
          const hString = endTime.substring(0,2);
            if (hString === '12'){
              h = 0;
            } else {
              h = parseInt(hString);
            }
        } else {
          const hString = endTime.substring(0,2);
          const h24 = parseInt(hString);
            if (hString === '12'){
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

export async function setWeeklyCheckInsAmericaChicago(event: any){
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
      if (dayOfTheWeek === 'Sunday'){
        dayIndex = 0;
      } else if (dayOfTheWeek === 'Monday'){
        dayIndex = 1;
      } else if (dayOfTheWeek === 'Tuesday'){
        dayIndex = 2;
      } else if (dayOfTheWeek === 'Wednesday'){
        dayIndex = 3;
      } else if (dayOfTheWeek === 'Thursday'){
        dayIndex = 4;
      } else if (dayOfTheWeek === 'Friday'){
        dayIndex = 5;
      } else {
        dayIndex = 6;
      }

      const startingDayInMilliseconds = new Date().getTime();
      const dayInMilliseconds = (millisecondsPerDay * dayIndex) + startingDayInMilliseconds;
      //GET EVENT START DATE & TIME
      const startDate = new Date(dayInMilliseconds);
      //Set hour
      if (startTime.includes('AM')){
          const hString = startTime.substring(0,2);
          if (hString === '12'){
            h = 0;
          } else {
            h = parseInt(hString);
          }
      } else {
        const hString = startTime.substring(0,2);
        const h24 = parseInt(hString);
          if (hString === '12'){
            h = 12;
          } else {
            h = 12 + h24;
          }
      }
      startDate.setHours(h);
      
      // Set Minutes
      mString = startTime.substring(startTime.indexOf(':') + 1, startTime.indexOf(':') + 3);
      m = parseInt(mString);
      if (m <= 6){
        m = 0;
      } else if (m <= 20){
        m = 15;
      } else if (m <= 40){
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
      if (endTime.includes('AM')){
        const hString = endTime.substring(0,2);
          if (hString === '12'){
            h = 0;
          } else {
            h = parseInt(hString);
          }
      } else {
        const hString = endTime.substring(0,2);
        const h24 = parseInt(hString);
          if (hString === '12'){
            h = 12;
          } else {
            h = 12 + h24;
          }
      }
      endDate.setHours(h);
      mString = endTime.substring(endTime.indexOf(':') + 1, endTime.indexOf(':') + 3);
      m = parseInt(mString);
      if (m <= 6){
        m = 0;
      } else if (m <= 20){
        m = 15;
      } else if (m <= 40){
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

export async function setMonthlyCheckInsAmericaChicago(event: any){
  // var i: number;
  // var h: number;
  // var m: number;
  // var mString: string;

  // const eventSnapshots = await admin.firestore().
  // collection('recurring_events')
  // .where('recurrenceType', '==', 'daily')
  // .where('timezone', '==', 'America/Chicago')
  // .get();
  
  // for (i = 0; i < eventSnapshots.docs.length; i++) {
  //     let startDateTime = new Date();
  //     let endDateTime = new Date();
  //     let recurringEventData = eventSnapshots.docs[i].data();
  //     let startTime = recurringEventData.startTime;
  //     let endTime = recurringEventData.endTime;
  //     let eventKey = (Math.floor(Math.random() * 99999999999999) + 1).toString();

  //     console.log(recurringEventData.title);
      

  //     //GET EVENT START TIME
  //     if (startTime.includes('AM')){
  //         let hString = startTime.substring(0,2);
  //         if (hString == '12'){
  //           h = 0;
  //         } else {
  //           h = parseInt(hString);
  //         }
  //     } else {
  //         let hString = startTime.substring(0,2);
  //         let h24 = parseInt(hString);
  //         if (hString == '12'){
  //           h = 12;
  //         } else {
  //           h = 12 + h24;
  //         }
  //     }
  //     mString = startTime.substring(startTime.indexOf(':') + 1, startTime.indexOf(':') + 3);
  //     m = parseInt(mString);

  //     startDateTime.setHours(h);
  //     startDateTime.setMinutes(m);
  //     startDateTime.setSeconds(0);

  //     console.log(startDateTime.getTime() + 18000000);
      

  //     //GET EVENT END TIME
  //     if (endTime.includes('AM')){
  //         let hString = endTime.substring(0,2);
  //         if (hString == '12'){
  //           h = 0;
  //         } else {
  //           h = parseInt(hString);
  //         }
  //     } else {
  //         let hString = endTime.substring(0,2);
  //         let h24 = parseInt(hString);
  //         if (hString == '12'){
  //           h = 12;
  //         } else {
  //           h = 12 + h24;
  //         }
  //     }
  //     mString = endTime.substring(endTime.indexOf(':') + 1, endTime.indexOf(':') + 3);
  //     m = parseInt(mString);

  //     endDateTime.setHours(h);
  //     endDateTime.setMinutes(m);
  //     endDateTime.setSeconds(0);

  //     console.log(endDateTime.getTime() + 18000000);

  //     await admin.firestore().doc("events/" + eventKey).create({
  //         eventKey: eventKey,
  //         location: recurringEventData.location,
  //         address: recurringEventData.address,
  //         authorUid: recurringEventData.authorUid,
  //         communityName: recurringEventData.comName,
  //         communityAreaName: recurringEventData.areaName,
  //         imageURL: recurringEventData.imageURL,
  //         title: recurringEventData.title,
  //         description: recurringEventData.description,
  //         recurrence: 'none',
  //         promoted: false,
  //         radius: recurringEventData.radius,
  //         tags: recurringEventData.tags,
  //         views: 0,
  //         estimatedTurnout: 0,
  //         actualTurnout: 0,
  //         fbSite: recurringEventData.fbSite,
  //         twitterSite: recurringEventData.twitterSite,
  //         website: recurringEventData.website,
  //         eventPayout: 0.00,
  //         pointsDistributedToUsers: false,        
  //         attendees: [],
  //         costToAttend: null,
  //         flashEvent: false,
  //         startDateInMilliseconds: startDateTime.getTime() + 18000000,
  //         endDateInMilliseconds: endDateTime.getTime() + 18000000,
  //     });
  // }
}

// export async function scheduleRecurringEvent(event: any){
//     const recurringEventData = event.data();
//     const recurrenceType = recurringEventData.recurrenceType;
//     const eventID = (Math.floor(Math.random() * 9999999999) + 1).toString();
    

// }

export async function distributeEventPoints(event: any){
  const currentDateTime = Date.now();  
  const eventSnapshots = await upcomingEventsRef.where('d.endDateInMilliseconds', '<=', currentDateTime).get();
  
  for (const eventDoc of eventSnapshots.docs) {
    const eventData = eventDoc.data().d;
    const attendees = eventData.attendees;
    console.log(attendees.length);
    const eventGeohash = eventDoc.data().g;
    const eventLoc = eventDoc.data().l;
    const eventKey = eventData.eventKey;
    //PLACE EVENT TO THE PAST
    await pastEventsRef.doc(eventKey).set({
      'd': eventData,
      'g': eventGeohash,
      'l': eventLoc
    });
    await upcomingEventsRef.doc(eventData.authorUid).collection('events').doc(eventKey).delete();
    await upcomingEventsRef.doc(eventKey).delete();

    //CALCUTATE PAYOUTS
   if (attendees.length > 0){
    for (const uid of attendees){
      const userSnapshot = await userRef.doc(uid).get();
      const userData = userSnapshot.data()!.d;
      const eventHistory = userData.eventHistory;
      eventHistory.push(eventKey);
      //AP & AMOUNT EARNED
      let ap = userData.ap;
      let apLvl = userData.apLvl;
      let eventsToLvlUp = userData.eventsToLvlUp;
      let eventPoints = userData.eventPoints;
      const amountEarned = Math.log(400) * (attendees.length) * ap;
      eventPoints = eventPoints + amountEarned;
      ap = ap - (ap * 0.15);
      if (eventsToLvlUp >= 1){
        eventsToLvlUp = eventsToLvlUp - 1;
      }
      if (eventsToLvlUp === 0 && apLvl < 5){
        apLvl = apLvl + 1;
        if (apLvl === 2){
          eventsToLvlUp = 50;
        } else if (apLvl === 3){
          eventsToLvlUp = 100;
        } else if (apLvl === 4){
          eventsToLvlUp = 200;
        }
      }
      await userRef.doc(uid).update({
        'd.ap': ap,
        'd.apLvl': apLvl,
        'd.eventsToLvlUp': eventsToLvlUp,
        'd.eventPoints': eventPoints,
        'd.eventHistory': eventHistory
      });    
    }
   }    
  }
}

export async function setEventRecommendations(event: any){
  //const messageTokens: any[] = [];
  const userQuery = await userRef.get();
  const currentDateTime = Date.now();

  for (const userDoc of userQuery.docs){
      const recommendedEvents: string[] = [];
      const userData = userDoc.data().d;
      const userLat = userDoc.data().l.latitude;
      const userLon = userDoc.data().l.longitude;
      const geoPoint = new admin.firestore.GeoPoint(userLat, userLon);
      const eventHistoryKeys = userData.eventHistory;

      console.log(eventHistoryKeys);

      for(const eventKey of eventHistoryKeys){
          const eventDoc = await pastEventsRef.doc(eventKey).get();
          if (eventDoc.exists){
            const eventData = eventDoc.data()!.d;
            const eventEndDateInMilliseconds = eventData.endDateInMilliseconds
            if ((currentDateTime - eventEndDateInMilliseconds) > 0){
              const eventTags = eventData.tags;
              for (const tag of eventTags){
                const recommendedQuery = await upcomingEventsGeoRef.near({center: geoPoint, radius: 20}).get();
                for (const recEventDoc of recommendedQuery.docs){
                  const docID = recEventDoc.id;
                  if (!recommendedEvents.includes(docID) && recEventDoc.data().tags.includes(tag)){
                    console.log("reccomending user event: " + docID);
                    recommendedEvents.push(docID);
                  }
                }
              }
            }
          } 
      }

      await userRef.doc(userDoc.id).update({
        'recommendedEvents': recommendedEvents
      });

  }

  // const payload = {
  //     notification: {
  //         title: "New Reccomendations Available!",
  //         body: "We have a new set of events we think you'll like 😍",
  //         badge: "1",
  //     },
  //     data: {
  //         "TYPE": "",
  //         "DATA": ""
  //     }
  // };
  
  // await messagingAdmin.sendToDevice(messageToken, payload);

  // const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
  // const notifExp = new Date().getTime() + 1209600000;
  // return admin.firestore().doc("user_notifications/" + notifKey).create({
  //     messageToken: messageToken,
  //     notificationData: "",
  //     notificationTitle: "New Deposit!",
  //     notificationDescription: pointDifference + " webblen has been deposited in your wallet",
  //     notificationExpirationDate: notifExp.toString(),
  //     notificationExpDate: notifExp,
  //     notificationKey: notifKey,
  //     notificationSeen: false,
  //     notificationSender: '',
  //     sponsoredNotification: false,
  //     notificationType: 'deposit',
  //     uid: newUserData.uid
  // });
}