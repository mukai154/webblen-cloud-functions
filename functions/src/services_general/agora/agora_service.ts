
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');


export async function generateAgoraToken(data: any){
    const channelName = data.channelName;
    const uid = data.uid;
    let role;
    if (data.role === 'publisher'){
        role = RtcRole.PUBLISHER;
    } else {
        role = RtcRole.SUBSCRIBER;
    }
    const appID = '60693de17bbe4f2598f9f465d1695de1';
    const appCertificate = 'a2dc17f3de01494f94b2f5114754dce6';

    const expirationTimeInSeconds = 3600; //5 min expiration
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    // Build token with uid
    const token = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);


    return token;
}