import * as admin from 'firebase-admin';

const request = require('request');

const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const database = admin.firestore();
const platformRef = database.collection('app_release_info');

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

export async function generateAgoraTokenWithIntUID(data: any){
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
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);


    return token;
}

export async function recordAgoraLiveStream(data: any){
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

export async function authenticateAgora(data: any){
    ///agora data
    const agoraDocRef = platformRef.doc('agora');
    const snapshot = await agoraDocRef.get();
    const snapshotData = snapshot.data()!;
    const appID = snapshotData.appID;
    const customerID = snapshotData.customerID.toString();
    const secret = snapshotData.secret.toString();

    //stream data
    const channelName = data.cname;
    const uid = data.uid;
    // const customerID = 'a44e314dd8e7458e83ce4d7284c0654e';
    // const secret = '8d48c060ffba43ecb12992882059f9b9';
    
    //compile credentials into base64
    
    const plainCredentials = customerID + ":" + secret;
    const encodedCredential = Buffer.from(plainCredentials).toString('base64')
    const authorizationField = "Basic " + encodedCredential

    console.log('AGORA AUTH HEADER: ' + authorizationField);

    // Set request parameters
    const options = {
        url: 'https://api.agora.io/dev/v1/projects',
        method: 'GET',
        headers: {
            'Authorization': authorizationField,
            'Content-Type': 'application/json'
        }
    }
    
    // Create request object and send request
    const httpsReq = new Promise<any>((resolve, reject) => {
        request(options, function (error:any, res:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });

    const response = await httpsReq;

    console.log('authenticate agora response: ' + response);
    
    await acquireCloudRecordingResourceID(authorizationField, appID, channelName, uid);
    
    return response;
}

export async function acquireCloudRecordingResourceID(authorization: any, appID: any, cname: any, uid: any){
    
    // Set request parameters
    const bodyData = {
        "cname": cname,
        "uid": "527841",
        "clientRequest": {}
      }

    const options = {
        url: 'https://api.agora.io/v1/apps/' + appID + '/cloud_recording/acquire',
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(bodyData)
    }
    
    // Create request object and send request
    const httpsReq = new Promise<any>((resolve, reject) => {
        request(options, function (error:any, res:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });

    const response = await httpsReq;

    console.log('acquireCloudRecordingResourceID response: ' + response.resourceId);
    
    
    return response;
}