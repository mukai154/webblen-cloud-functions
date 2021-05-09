import * as admin from 'firebase-admin';

const database = admin.firestore();

const userRef = database.collection('webblen_users');
const streamsRef = database.collection('webblen_live_streams');
const notificationsRef = database.collection('webblen_notifications');


export async function createNotificationForWebblenLiveStream(stream: any, authorUsername: any, followersToNotify: any){
    const header = "@" + authorUsername + " Scheduled a New Live Stream";
    const subHeader = stream.title;
    const type = "stream";
    const read = false;
    const senderUID = stream.authorID;
    const timePostedInMilliseconds = new Date().getTime();
    const expDateInMilliseconds = timePostedInMilliseconds + 1209600000; //post expires in 3 months
    
    //send notification to suggested users if stream is public
    if (stream.privacy === "Public"){
        for (const uid of followersToNotify) {
            const doc = await userRef.doc(uid).get();
            if (doc.exists) {
                
                const docData = doc.data()!;
                
                //check if user has a message token
                if (docData.messageToken !== undefined && docData.messageToken.length > 0){

                    //check the users last notification time
                    if (docData.lastNotificationTimeInMilliseconds !== undefined){
                        let lastNotificationTimeInMilliseconds = docData.lastNotificationTimeInMilliseconds;
                        if (doc.data()!.lastNotificationTimeInMilliseconds !== undefined) {
                            
                            lastNotificationTimeInMilliseconds = doc.data()!.lastNotificationTimeInMilliseconds;
                            const currentDateInMilliseconds = new Date().getTime();

                            //send notification if it's been at least 30 minutes since the user's last notification
                            if (currentDateInMilliseconds - 3600000 > lastNotificationTimeInMilliseconds) {
                                    
                                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();

                                await notificationsRef.doc(notifKey).set({
                                    'header': header,
                                    'subHeader': subHeader,
                                    'type': type,
                                    'read': read,
                                    'receiverUID': uid,
                                    'senderUID': senderUID,
                                    'expDateInMilliseconds': expDateInMilliseconds,
                                    'timePostedInMilliseconds': currentDateInMilliseconds,
                                    'additionalData': {
                                        'id': stream.id,
                                    }
                                });

                                await userRef.doc(uid).update({
                                    "lastNotificationTimeInMilliseconds": currentDateInMilliseconds,
                                });                                           
                            }
                        }
                    }

                }
                
                
            }
        }
    }
}

export async function checkIntoWebblenLiveStream(data: any, context: any){
    //Get Params
    const streamID = data.streamID;
    const uid = data.uid;
    const userAP = data.ap;

    //Set Check-In Time
    const checkInTimeInMilliseconds = Date.now();

    //Get Livestream Reference
    const docRef = streamsRef.doc(streamID);
    const doc = await streamsRef.doc(streamID).get();

    //Get Current Stream Viewers
    const viewers = doc.data()!.viewers;

    //Check If User Has Already Checked-In
    for (const val of viewers){
        if (uid in val){
           return;
        } 
    }

    //If User Has NOT Checked-In, Log Check-In
    const checkIn = {
        uid: {
            'checkInTime': checkInTimeInMilliseconds,
            'checkOutTime': null,
            'ap': userAP,
        }
    };

    viewers.push(checkIn);

    //Update Stream Viewers
    await docRef.update({
        'viewers': viewers,
    });

    //Update User AP
    if (userAP > 0.02) {
        const updatedAP = userAP - 0.02;
        await userRef.doc(data.uid).update({ 'ap': updatedAP });
    }

    return true;

}

export async function calculateAndDistributeLiveStreamPayouts(event: any) {
    const currentDateTime = Date.now();
    const snapshots = await streamsRef
        .where('paidOut', '==', false)
        .where('endDateTimeInMilliseconds', '<=', currentDateTime)
        .get();
    for (const doc of snapshots.docs) {
        const docData = doc.data().d;
        const viewers = docData.viewers;

        //get uids from attendees data map
        for (const uid in viewers) {

        
            
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!.d;
            let ap = userData.ap;
            if (ap <= 5.00) {
                ap = ap + 0.04;
            }
            const pay = 1 + (ap * viewers.length);
            const newBalance = userData.WBLN + pay;
            await userRef.doc(uid).update({ "ap": ap, "WBLN": newBalance });
        }
        await streamsRef.doc(doc.id).update({ 'paidOut': true });
    }
}

