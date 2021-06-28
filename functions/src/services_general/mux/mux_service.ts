import * as admin from 'firebase-admin';

const Mux = require('@mux/mux-node');
const request = require('request');


const database = admin.firestore();
const platformRef = database.collection('app_release_info');
const streamsRef = database.collection('webblen_live_streams');

//MOBILE REQUESTS
export async function createMuxStream(data: any) {
    let err = "";

    //request data
    const streamID = data.streamID;    
    const twitchStreamKey = data.twitchStreamKey;
    const youtubeStreamKey = data.youtubeStreamKey;
    const fbStreamKey = data.fbStreamKey;
    const simulcastTargets = [];
    
    //configure simulcast targets
    if (twitchStreamKey.length !== 0){
        const targetData = {
            "url": "rtmp://live-iad.twitch.tv/app/",
            "stream_key": twitchStreamKey,
            "passthrough": "twitch stream"
        };
        simulcastTargets.push(targetData);
    }
    if (youtubeStreamKey.length !== 0){
        const targetData = {
            "url": "rtmp://a.rtmp.youtube.com/live2",
            "stream_key": youtubeStreamKey,
            "passthrough": "youtube stream"
        };
        simulcastTargets.push(targetData);
    }
    if (fbStreamKey.length !== 0){
        const targetData = {
            "url": "rtmps://live-api-s.facebook.com:443/rtmp/",
            "stream_key": fbStreamKey,
            "passthrough": "fb stream"
        };
        simulcastTargets.push(targetData);
    }
    
    console.log(simulcastTargets);

    //mux data & credentials
    const muxDoc = await platformRef.doc('mux').get();
    const snapshotData = muxDoc.data()!;
    const accessToken = snapshotData.token;
    const secret = snapshotData.secret;
        
    //mux auth
    const plainCredentials = accessToken + ":" + secret;
    const encodedCredential = Buffer.from(plainCredentials).toString('base64')
    const authorizationField = "Basic " + encodedCredential

    const requestURL = 'https://api.mux.com/video/v1/live-streams';

    const requestJsonData = JSON.stringify({
        playback_policy: 'public',
        new_asset_settings: { 
            playback_policy: 'public',
            input: [
                {
                "url": "https://firebasestorage.googleapis.com/v0/b/webblen-events.appspot.com/o/app_images%2Ftiny%20webblen%20logo.png?alt=media&token=384520b6-df58-4016-8dd6-bf8f371e6bbd",
                "overlay_settings": {
                    "vertical_align": "bottom",
                    "vertical_margin": "2%",
                    "horizontal_align": "right",
                    "horizontal_margin": "2%",
                    "height": "85px",
                    "opacity": "80%"
                }
                }
            ] 
        },
        reconnect_window: 300
        //simulcastTargets: simulcastTargets,
        
    });

    console.log("MUX TARGET DATA: " + requestJsonData);

    //Set request parameters
    const options = {
        url: requestURL,
        method: 'POST',
        headers: {
            'Authorization': authorizationField,
            'Content-Type': 'application/json'
        },
        body: requestJsonData
    }

    // Create request object and send request
    const httpsReq = new Promise<any>((resolve, reject) => {
        request(options, function (error:any, res:any, body:any) {
            if (error !== null){
                err = error;
            }
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
            resolve(JSON.parse(body));
            reject('error');
        });
      });

    const response = await httpsReq;
    
    console.log(response);

    if (err.length == 0){
        console.log(response);
        const muxStreamID = response['data']['id'];
        const muxStreamKey = response['data']['stream_key'];

        await streamsRef.doc(streamID).update({
            "muxStreamID": muxStreamID,
            "muxStreamKey": muxStreamKey,
        });
    }

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
