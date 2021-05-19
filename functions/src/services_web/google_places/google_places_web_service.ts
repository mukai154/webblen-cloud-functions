import * as admin from 'firebase-admin';
import * as request from 'request';

const database = admin.firestore();
const googleDocRef = database.collection('app_release_info').doc('google');

export async function googleSearchAutocompleteWeb(req: any, res: any){
    //get search input & google api key
    const requestData = req.body.data;
    const input = requestData.input;
    const key = requestData.key;

    //request data
    const requestURL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&key=' + key;
    const httpsReq = new Promise<any>((resolve, reject) => {
        request(requestURL, function (error:any, result:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', result && result.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });
    
    //return response data
    const response = await httpsReq;
    console.log(response);
    const predictions = response.predictions;
    res.send({'data': predictions});
}

export async function getLatLonFromGooglePlaceIDWeb(req: any, res: any){
    //get search input & google api key
    const requestData = req.body.data;
    const placeID = requestData.placeID;
    const key = requestData.key;

    //request data
    const requestURL = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeID + '&key=' + key;
    const httpsReq = new Promise<any>((resolve, reject) => {
        request(requestURL, function (error:any, result:any, body:any) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', result && result.statusCode); // Print the response status code if a response was received
          resolve(JSON.parse(body));
          reject('error');
          });
      });
    
    //return response data
    const response = await httpsReq;
    console.log(response);
    const responseData = response.result;
    //const address = responseData.formattedAddress;
    const lat = responseData.geometry.location.lat;
    const lon = responseData.geometry.location.lng;
     
    res.send({
        'data': {
            'lat': lat, 
            'lon': lon
        }
    });
}

export async function getLocationDetailsFromLatLonWeb(req: any, res: any){
    const NodeGeocoder = require('node-geocoder');
    const requestData = req.body.data;
    const lat = requestData.lat;
    const lon = requestData.lon;
    const key = requestData.key;

    const options = {
      provider: 'google',
      apiKey: key,
    };

    const geocoder = NodeGeocoder(options);
    const details = await geocoder.reverse({ lat: lat, lon: lon});
    console.log(res);
    res.send({'data': details[0]});
}
  
  export async function getLocationDetailsFromAddress(data: any){
    const NodeGeocoder = require('node-geocoder');
    const address = data;
    const googleData = await googleDocRef.get();
    const key = googleData.data()!.apiKey;
    const options = {
      provider: 'google',
      apiKey: key,
    };
    const geocoder = NodeGeocoder(options);
    const res = await geocoder.geocode(address);
    return res[0];
  }
  