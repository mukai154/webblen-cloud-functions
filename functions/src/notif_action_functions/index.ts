import * as admin from 'firebase-admin'
const database = admin.firestore();
const comRef = database.collection('locations');
const userRef = database.collection('webblen_user');
const userNotifRef = database.collection('user_notifications');

//Community Notif Actions
export async function acceptCommunityInvite(data: any, context: any){
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    console.log(data.areaName);
    console.log(data.comName);
    
    
    if (comDoc.exists){
        //Update Com Data
        let memberIDs = [];
        const comData = comDoc.data()!;
        memberIDs = comData.memberIDs;
        memberIDs.push(data.uid);
        let comStatus = comData.status;
        let activityCount = comData.activityCount;
        if (memberIDs.length >= 3){
            comStatus = 'active';
        }
        activityCount = activityCount + 1;
        await comRef.doc(data.areaName).collection('communities').doc(data.comName).update({
            'memberIDs': memberIDs,
            'activityCount': activityCount,
            'status': comStatus,
        });

         //Update User Data
        const userDoc = await userRef.doc(data.uid).get();
        const userData = userDoc.data()!.d;
        const userComs = userData.communities;
        const memberAreas = Object.keys(userComs);
        if (memberAreas.includes(data.areaName)){
            const memberComsInArea = userComs[data.areaName];
            if (memberComsInArea.includes(data.comName)){
                const comIndex = memberComsInArea.indexOf(data.comName);
                memberComsInArea.splice(comIndex);
            } else {
                memberComsInArea.push(data.comName);
            }
            userComs[data.areaName] = memberComsInArea;
        } else {
            userComs[data.areaName] = [data.comName];
        }
        await userRef.doc(data.uid).update({
            'd.communities': userComs
        });
    }
    await userNotifRef.doc(data.notifKey).delete();
    return true;
}

//Friend Notif Actions
export async function acceptFriendRequest(data: any, context: any){
    const requesterDoc = await userRef.doc(data.requesterUID).get();
    const receiverDoc = await userRef.doc(data.receiverUID).get();
    const requesterData = requesterDoc.data()!.d;
    const receiverData = receiverDoc.data()!.d;
    const requesterFriends = requesterData.friends;
    const receiverFriends = receiverData.friends;
    requesterFriends.push(data.receiverUID);
    receiverFriends.push(data.requesterUID);
    await userRef.doc(data.requesterUID).update({
        'd.friends': requesterFriends
    });
    await userRef.doc(data.receiverUID).update({
        'd.friends': receiverFriends
    });
    if (data.notifKey.length > 0){
        await userNotifRef.doc(data.notifKey).delete();
    }
   
    return true;
}

export async function denyFriendRequest(data: any, context: any){
    await userNotifRef.doc(data.notifKey).delete();
    return true;
}