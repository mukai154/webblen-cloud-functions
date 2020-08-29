//import * as admin from 'firebase-admin'
//**
//**
//** 
//CREATE

//**
//**
//** 
//READ
export async function getNearbyAds(data: any, context: any){
    const adsData: any[] = [];
    // const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    // const adsQuery = await localAdsRef.near({center: geoPoint, radius: 10}).get();
    // for (const doc of adsQuery.docs){
    //     adsData.push(doc.data());
    // }
    // console.log(adsData.length);
    // return adsData;
    //return userDoc.data();
    return adsData;
}


//**
//**
//** 
//UPDATE

//**
//**
//** 
//DELETE
