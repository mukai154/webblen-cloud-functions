import * as admin from 'firebase-admin';
import * as request from 'request';

const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const {Base64} = require('js-base64');
//const axios = require('axios');
// const database = admin.firestore();
// const eventsRef = admin.firestore().collection('events');
const agoraDocRef = admin.firestore().collection('app_release_info').doc('agora');
const awsDocRef = admin.firestore().collection('app_release_info').doc('aws');

export async function retrieveAgoraToken(data: any){
    const event = data.event;
    const agoraUID = data.agoraUID;
    const agoraDoc = await agoraDocRef.get();
    const appID = agoraDoc.data()!.appID;
    const appCertificate = agoraDoc.data()!.appCertificate;
    const channelName = event.id;
    const role = RtcRole.PUBLISHER; 

    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, agoraUID, role, 0);
    return {'token': token};
}

export async function startAgoraCloudRecording(data: any){

    //Variables
    const event = data.event;
    const channelName = event.id;
    //const uid = data.uid;
    const streamerAgoraID = data.agoraStreamerID;
    const token = data.token;

    //AGORA KEYS
    const agoraDoc = await agoraDocRef.get();
    const appID = agoraDoc.data()!.appID;
    //const appCertificate = agoraDoc.data()!.appCertificate;
    const customerID = agoraDoc.data()!.customerID;
    const secret = agoraDoc.data()!.secret;
    const agoraCredentials = Base64.encode(customerID + ":" + secret);
   
    //GENERATE TOKEN
    //const role = RtcRole.PUBLISHER; 
    //const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 1, role, 0);    
    
    //AWS
    const awsDoc = await awsDocRef.get();
    const awsAccessKey = awsDoc.data()!.accessKey;
    const awsSecretKey = awsDoc.data()!.secretKey;
    
    const reqHeaders = {"Authorization": "Basic" + agoraCredentials, "Content-type": "application/json"};
    const acquireReqBody = {
        "cname": event.id,
        "uid": "1",
        "clientRequest": {
          "resourceExpiredHour": 24
        }
      };
    console.log(reqHeaders);
    

    //GET RESOURCE ID
    const acquireURL = 'https://api.agora.io/v1/apps/' + appID + '/cloud_recording/acquire';
    const acquireResourceID = {
        method: 'POST',
        url:  encodeURI(acquireURL),
        headers: reqHeaders,
        body: JSON.stringify(acquireReqBody)
    }

    const resourceIDRequest = new Promise<any>((resolve, reject) => {
        request(acquireResourceID, function (error:any, res:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });
    
    const resourceIDResponse = await resourceIDRequest;
    console.log(resourceIDResponse);
    
    const resourceID = resourceIDResponse.resourceId;
    
    console.log(resourceID);

    //START RECORDING
    const recordingReqBody = {
        "cname": channelName,
        "uid": "1",
                "clientRequest": {
                "token": token,
                  "recordingConfig": {
                    "maxIdleTime": 30,
                    "streamTypes": 2,
                    "channelType": 1,
                    "videoStreamType": 0,
                    "transcodingConfig": {
                      "height": 640,
                      "width": 360,
                      "bitrate": 500,
                      "fps": 15,
                      "mixedVideoLayout": 1,
                      "backgroundColor": "#FF0000"
                    },
                    "subscribeVideoUids": [
                        streamerAgoraID
                    ],
                    "subscribeAudioUids": [
                        streamerAgoraID
                    ],
                    "subscribeUidGroup": 0
                  },
                  "recordingFileConfig": {
                    "avFileType": [
                      "hls"
                    ]
                  },
          "storageConfig": {
            "accessKey": awsAccessKey,
            "region": 1,
            "bucket": "recorded-live-streams",
            "secretKey": awsSecretKey,
            "vendor": 1,
            "fileNamePrefix": [
              "directory1",
              "directory2"
            ]
          }
        }
      };

      
      const startRecordingURL = encodeURI('https://api.agora.io/v1​/apps​/' + appID + '​/cloud_recording​/resourceid​/' + resourceID + '​/mode​/mix/start');
      console.log(startRecordingURL);

      const startRecordingOptions = {
        method: 'POST',
        url:  startRecordingURL,
        headers: reqHeaders,
        body: JSON.stringify(recordingReqBody)
    }

    const startVideoRecordingReq = new Promise<any>((resolve, reject) => {
        request(startRecordingOptions, function (error:any, res:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });
    
    const startVidRecordingResponse = await startVideoRecordingReq;

    console.log(startVidRecordingResponse);
    
    

    return {'resourceID': resourceID.resourceId, 'sid': startVidRecordingResponse.sid};
}