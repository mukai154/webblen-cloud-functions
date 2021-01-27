import * as admin from 'firebase-admin'

const database = admin.firestore();
const userRef = admin.firestore().collection('webblen_users');
const eventsRef = database.collection('webblen_events');

export async function distributeEventPay(event: any){
    //Get Current Date
    const currentDateTime = Date.now();  

    //Get Events That Have Ended Before Date Above
    const eventSnapshots = await eventsRef
    .where('paidOut', '==', false)
    .where('endDateTimeInMilliseconds', '<=', currentDateTime)
    .get();

    //For Each Event Get the Attendees
    for (const eventDoc of eventSnapshots.docs) {
      const eventData = eventDoc.data()!;
      const attendees = eventData.attendees;

      //For Each Attendee of a Given Event, Get the Attendee's AP
      for (const uid of attendees){
        const userDoc = await userRef.doc(uid).get();
        const userData = userDoc.data()!;
        let ap = userData.ap;

        //Decrease User's AP
        const subtractedAP = ap * 0.30; //Subtract 30% of AP (Temporary Solution) 
        ap -= subtractedAP;

        
        const pay = 1 + (ap * attendees.length); //Users make at least 1 WBLN for attendending an event 
        const newWBLNBalance = userData.WBLN + pay;
        await userRef.doc(uid).update({"ap": ap, "WBLN": newWBLNBalance});
      }
      await eventsRef.doc(eventDoc.id).update({'paidOut': true});
    }
  }