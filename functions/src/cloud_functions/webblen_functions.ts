import * as admin from 'firebase-admin'

const database = admin.firestore();
const userRef = admin.firestore().collection('webblen_users');
const eventsRef = database.collection('webblen_events');

export async function distributeEventPay(event: any) {
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
    for (const uid of attendees) {
      const userDoc = await userRef.doc(uid).get();
      const userData = userDoc.data()!;
      let ap = userData.ap;

      //Decrease User's AP
      const subtractedAP = ap * 0.30; //Subtract 30% of AP (Temporary Solution) 
      ap -= subtractedAP;


      const pay = 1 + (ap * attendees.length); //Users make at least 1 WBLN for attendending an event 
      const newWBLNBalance = userData.WBLN + pay;
      await userRef.doc(uid).update({ "ap": ap, "WBLN": newWBLNBalance });
    }
    await eventsRef.doc(eventDoc.id).update({ 'paidOut': true });
  }
}

export async function rechargeUserAP(event: any) {
  const currentDateInMilliseconds = Date.now();
  //const dateInMilliseconds3DaysAgo = currentDateInMilliseconds - 259200000;
  const userQuery = await userRef.where('lastAPRechargeInMilliseconds', '<=', currentDateInMilliseconds).get();
  for (const userDoc of userQuery.docs) {
    const userData = userDoc.data().d;
    let ap = userData.ap;
    const apLvl = userData.apLvl;
    if (apLvl === 1) {
      if (ap !== 0.2) {
        const apDiff = 0.2 - ap;
        ap = ap + (0.75 * apDiff);
      }
    } else if (apLvl === 2) {
      if (ap !== 0.4) {
        const apDiff = 0.4 - ap;
        ap = ap + (0.55 * apDiff);
      }
    } else if (apLvl === 3) {
      if (ap !== 0.6) {
        const apDiff = 0.6 - ap;
        ap = ap + (0.35 * apDiff);
      }
    } else if (apLvl === 4) {
      if (ap !== 0.8) {
        const apDiff = 0.8 - ap;
        ap = ap + (0.25 * apDiff);
      }
    } else if (apLvl === 5) {
      if (ap !== 1.0) {
        const apDiff = 1 - ap;
        ap = ap + (0.15 * apDiff);
      }
    }
    await userRef.doc(userDoc.id).update({
      'd.ap': ap,
      'lastAPRechargeInMilliseconds': currentDateInMilliseconds
    });
  }
  return true
}

export async function addWebblenToFollowers(data: any) {
    const uid = data.d.uid;
    const webblenUID = 'EtKiw3gK37QsOg6tPBnSJ8MhCm23';
    const userFollowing = [webblenUID];
    const webblenDoc = await userRef.doc(webblenUID).get();
    const webblenFollowers = webblenDoc.data()!.d.followers;
    webblenFollowers.push(uid);

    await userRef.doc(webblenUID).update({
        'd.followers': webblenFollowers,
    });

    return userRef.doc(uid).update({
        'd.webblen': 0.001,
        'd.impactPoints': 1.001,
        'd.followers': [],
        'd.following': userFollowing,
    });
}