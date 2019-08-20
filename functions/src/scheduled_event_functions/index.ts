import * as admin from 'firebase-admin'

const upcomingEventsRef = admin.firestore().collection('upcoming_events');
const pastEventsRef = admin.firestore().collection('past_events');
const userRef = admin.firestore().collection('webblen_user');

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

        await admin.firestore().doc("upcoming_events/" + eventKey).create({
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
    const eventGeohash = eventDoc.data().g;
    const eventLoc = eventDoc.data().l;
    const eventKey = eventData.eventKey;
    //PLACE EVENT TO THE PAST
    await pastEventsRef.doc(eventKey).set({
      'd': eventData,
      'g': eventGeohash,
      'l': eventLoc
    });
    await upcomingEventsRef.doc(eventKey).delete();

    //CALCUTATE PAYOUTS
    const attendees = eventData.attendees;
      const eventPayout = eventData.eventPayout;
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
        const amountEarned = (eventPayout * (attendees.length)) * ap;
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