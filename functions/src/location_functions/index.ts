import * as admin from 'firebase-admin'
import * as request from 'request'

const appRef = admin.firestore().collection('app_release_info');


export async function findNearestZipcodes(data: any, context: any){
  const zipcode = data.zipcode;
  const zipcodeApiDocRef = await appRef.doc('zipcodes_api').get();
  const zipcodeApiKey = zipcodeApiDocRef.data()!.apiKey;
  const zipApiRequestURL = 'https://www.zipcodeapi.com/rest/' + zipcodeApiKey + '/radius.json/' + zipcode + '/10/miles?minimal'
  const httpsReq = new Promise<any>((resolve, reject) => {
    request(zipApiRequestURL, function (error:any, res:any, body:any) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
      resolve(JSON.parse(body));
      reject('error');
      });
  });
  const zipApiResponse = await httpsReq;
  const zips = zipApiResponse.zip_codes;
  return {'data': zips};
}

export async function reverseGeocodeLatLon(data: any, context: any){
  const NodeGeocoder = require('node-geocoder');
  const lat = data.lat;
  const lon = data.lon;
  const googleDocRef = await appRef.doc('google').get();
  const googleApiKey = googleDocRef.data()!.apiKey;
  const options = {
    provider: 'google',
    apiKey: googleApiKey,
  };
  const geocoder = NodeGeocoder(options);
  const res = await geocoder.reverse({ lat: lat, lon: lon});
  console.log(res);
  return {'data': res};
}

export async function getInfoFromAddress(data: any){
  const NodeGeocoder = require('node-geocoder');
  const address = data;
  const googleDocRef = await appRef.doc('google').get();
  const googleApiKey = googleDocRef.data()!.apiKey;
  const options = {
    provider: 'google',
    apiKey: googleApiKey,
  };
  const geocoder = NodeGeocoder(options);
  const res = await geocoder.geocode(address);
  return res[0];
}

export async function getNearbyZipcodes(zipcode: string){
  const zipcodeApiDocRef = await appRef.doc('zipcodes_api').get();
  const zipcodeApiKey = zipcodeApiDocRef.data()!.apiKey;
  const zipApiRequestURL = 'https://www.zipcodeapi.com/rest/' + zipcodeApiKey + '/radius.json/' + zipcode + '/10/miles?minimal'
  const httpsReq = new Promise<any>((resolve, reject) => {
    request(zipApiRequestURL, function (error:any, res:any, body:any) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
      resolve(JSON.parse(body));
      reject('error');
      });
  });
  const zipApiResponse = await httpsReq;
  const zips = zipApiResponse.zip_codes;
  return zips;
}