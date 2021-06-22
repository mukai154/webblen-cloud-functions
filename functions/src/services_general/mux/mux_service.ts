import * as admin from 'firebase-admin';

const Mux = require('@mux/mux-node');
const request = require('request');


const database = admin.firestore();
const platformRef = database.collection('app_release_info');
const streamsRef = database.collection('webblen_live_streams');

//MOBILE REQUESTS

//streams
export async function createMuxStream(data: any) {
    let error = "";
    const simulcastTargets = [];

    //stream key data
    const streamID = data.streamID;    
    const twitchStreamKey = data.twitchStreamKey;
    const youtubeStreamKey = data.youtubeStreamKey;
    const fbStreamKey = data.fbStreamKey;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret);
    
    //add stream keys
    if (twitchStreamKey.length !== 0){
        const streamData = {
            "url": "rtmp://live-iad.twitch.tv/app/",
            "stream_key": twitchStreamKey
        };
        simulcastTargets.push(streamData);
    }
    if (youtubeStreamKey.length !== 0){
        const streamData = {
            "url": "rtmp://a.rtmp.youtube.com/live2",
            "stream_key": youtubeStreamKey
        };
        simulcastTargets.push(streamData);
    }
    if (fbStreamKey.length !== 0){
        const streamData = {
            "url": "rtmps://live-api-s.facebook.com:443/rtmp/",
            "stream_key": fbStreamKey
        };
        simulcastTargets.push(streamData);
    }
    
    //create livestream
    const response = await Video.LiveStreams.create({
        playback_policy: 'public',
        new_asset_settings: { 
            playback_policy: 'public',
            input: [
                {
                "url": "https://firebasestorage.googleapis.com/v0/b/webblen-events.appspot.com/o/app_images%2FtinyLogo.png?alt=media&token=c8fdcce3-34a7-4455-b07f-8daf254a65be",
                "overlay_settings": {
                    "vertical_align": "bottom",
                    "vertical_margin": "5%",
                    "horizontal_align": "right",
                    "horizontal_margin": "5%",
                    "width": "80px",
                    "opacity": "90%"
                }
                }
            ] 
        },
        reconnect_window: 300,
        //test: true,

       }).catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    //log mux stream id & key
    if (error.length == 0){
        console.log(response);
        await streamsRef.doc(streamID).update({
            "muxStreamID": response['id'],
            "muxStreamKey": response['stream_key'],
        });

        //configure simulcast targets
        if (simulcastTargets.length > 0){
            for (const targetData of simulcastTargets){
                const muxData = {
                    'muxStreamID': response['id'],
                    'targetData': targetData,
                }; 
                try {
                    await configureStreamSimulcastTarget(muxData, accessToken, secret);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
    console.log(response);
    return response;
}

async function configureStreamSimulcastTarget(data: any, accessToken: any, secret: any) {
    //let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    console.log("MUX STREAM ID: " + muxStreamID);
    
    const targetData = data.targetData;
    console.log("MUX TARGET DATA: " + targetData);
        
    //create simultaneous livestream
    const plainCredentials = accessToken + ":" + secret;
    const encodedCredential = Buffer.from(plainCredentials).toString('base64')
    const authorizationField = "Basic " + encodedCredential

    const requestURL = 'https://api.mux.com/video/v1/live-streams/' + muxStreamID + '/simulcast-targets';

    //Set request parameters
    const options = {
        url: requestURL,
        method: 'PUT',
        headers: {
            'Authorization': authorizationField,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(targetData)
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
    
    console.log(response);

    return response;
}

export async function retrieveMuxStream(data: any) {
    let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //create livestream
    const response = await Video.LiveStreams.get(muxStreamID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}

export async function enableMuxStream(data: any) {
    let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.LiveStreams.enable(muxStreamID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}

export async function disableMuxStream(data: any) {
    let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.LiveStreams.disable(muxStreamID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}

export async function completeMuxStream(data: any) {
    let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.LiveStreams.signalComplete(muxStreamID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}

export async function deleteMuxStream(data: any) {
    let error = "";

    //request data
    const muxStreamID = data.muxStreamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.LiveStreams.del(muxStreamID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}


//assets
export async function retrieveMuxAsset(data: any) {
    let error = "";

    //request data
    const muxAssetID = data.muxAssetID;
    
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.Assets.get(muxAssetID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}

export async function deleteMuxAsset(data: any) {
    let error = "";
    
    //request data
    const muxAssetID = data.muxAssetID;
    
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
     
    //enable livestream
    const response = await Video.Assets.del(muxAssetID)
    .catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    return response;
}



//WEB REQUESTS
export async function initializeMuxStreamWeb(req: any, res: any) {
    let error = "";

    //request data    
    const requestData = req.body.data;
    const streamID = requestData.streamID;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 
    
    //create livestream
    const response = await Video.LiveStreams.create({
        passthrough: streamID,
        playback_policy: 'public',
        new_asset_settings: { 
            playback_policy: 'public',
            input: [
                {
                "url": "https://muxed.s3.amazonaws.com/example-watermark.png",
                "overlay_settings": {
                    "vertical_align": "bottom",
                    "vertical_margin": "10%",
                    "horizontal_align": "right",
                    "horizontal_margin": "10%",
                    "width": "25%",
                    "opacity": "90%"
                }
                }
            ] 
        },
        reconnect_window: 300,
        
       }).catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
    
    console.log(response);

    return response;
}

export async function createSimulcastStreamWeb(req: any, res: any) {
    let error = "";

    //request data
    const requestData = req.body.data;    
    const muxStreamID = requestData.muxStreamKey;
    const platformStreamURL = requestData.platformStreamURL;
    const platformStreamKey = requestData.platformStreamURL;
    const platformName = requestData.platformName;
    
    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;

    const { Video } = new Mux(accessToken, secret); 

    const response = await Video.LiveStreams.createSimulcastTarget(
        muxStreamID, {
            url: platformStreamURL,
            stream_key: platformStreamKey,
            passthrough: platformName,
        }
    ).catch(function onError(e:any) {
        error = e.toString();
        console.log(error);
      });
   
    console.log(response);

    return response;
}
