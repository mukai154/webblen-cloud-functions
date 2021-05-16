  // import * as admin from 'firebase-admin'

// const database = admin.firestore();
// const userRef = admin.firestore().collection('webblen_users');
// const eventsRef = database.collection('webblen_events');


export async function distributeEventPayout(event: any){
    // const currentDateTime = Date.now();  
    // const querySnapshot = await eventsRef
    // .where('paidOut', '==', false)
    // .where('endDateInMilliseconds', '<=', currentDateTime)
    // .get();
    
    // for (const doc of querySnapshot.docs) {
    //   const docData = eventDoc.data().d;
    //   const attendees = eventData.attendees;
    //   console.log(attendees.length);
    //   const eventGeohash = eventDoc.data().g;
    //   const eventLoc = eventDoc.data().l;
    //   const eventKey = eventData.eventKey;
    //   //PLACE EVENT TO THE PAST
    //   await pastEventsRef.doc(eventKey).set({
    //     'd': eventData,
    //     'g': eventGeohash,
    //     'l': eventLoc
    //   });
    //   await upcomingEventsRef.doc(eventData.authorUid).collection('events').doc(eventKey).delete();
    //   await upcomingEventsRef.doc(eventKey).delete();
  
    //   //CALCUTATE PAYOUTS
    //  if (attendees.length > 0){
    //   for (const uid of attendees){
    //     const userSnapshot = await userRef.doc(uid).get();
    //     const userData = userSnapshot.data()!.d;
    //     const eventHistory = userData.eventHistory;
    //     eventHistory.push(eventKey);
    //     //AP & AMOUNT EARNED
    //     let ap = userData.ap;
    //     let apLvl = userData.apLvl;
    //     let eventsToLvlUp = userData.eventsToLvlUp;
    //     let eventPoints = userData.eventPoints;
    //     const amountEarned = Math.log(400) * (attendees.length) * ap;
    //     eventPoints = eventPoints + amountEarned;
    //     ap = ap - (ap * 0.15);
    //     if (eventsToLvlUp >= 1){
    //       eventsToLvlUp = eventsToLvlUp - 1;
    //     }
    //     if (eventsToLvlUp === 0 && apLvl < 5){
    //       apLvl = apLvl + 1;
    //       if (apLvl === 2){
    //         eventsToLvlUp = 50;
    //       } else if (apLvl === 3){
    //         eventsToLvlUp = 100;
    //       } else if (apLvl === 4){
    //         eventsToLvlUp = 200;
    //       }
    //     }
    //     await userRef.doc(uid).update({
    //       'd.ap': ap,
    //       'd.apLvl': apLvl,
    //       'd.eventsToLvlUp': eventsToLvlUp,
    //       'd.eventPoints': eventPoints,
    //       'd.eventHistory': eventHistory
    //     });    
    //   }
    //  }    
    // }
  }