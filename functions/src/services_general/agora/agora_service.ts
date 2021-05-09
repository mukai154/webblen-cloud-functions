import * as admin from 'firebase-admin';

const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const streamsRef = admin.firestore().collection('webblen_live_streams');
const agoraDocRef = admin.firestore().collection('app_release_info').doc('agora');

export async function generateAgoraToken(data: any){
    const streamID = data.streamID;
    const channelName = data.streamTitle;
    const agoraUID = data.agoraUID;
    const agoraDoc = await agoraDocRef.get();
    const appID = agoraDoc.data()!.appID;
    const appCertificate = agoraDoc.data()!.appCertificate;
    const role = RtcRole.PUBLISHER; 

    const expirationTimeInSeconds = 172800000; //48hr expiration

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    // Build token with uid
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, agoraUID, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + token);    
    await streamsRef.doc(streamID).update({
        'agoraToken': token,
    });
}