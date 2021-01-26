import * as admin from 'firebase-admin';

const eventsRef = admin.firestore().collection('webblen_events');


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
