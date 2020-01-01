import * as admin from 'firebase-admin'
const database = admin.firestore();
const reqRef = database.collection('community_requests');
// const pastEventsRef = database.collection('past_events');


//**
//**
//** 
//CREATE

//**
//**
//** 
//READ


export async function getCommunityRequests(data: any, context: any){
    const requests = [];
    const areaReqQuery = await reqRef
    .where('areaName', '==', data.areaName)
    .get();
    for (const reqDoc of areaReqQuery.docs){
        requests.push(reqDoc.data());
    }
    const appReqQuery = await reqRef
    .where('requestType', '==', 'app')
    .get();
    for (const reqDoc of appReqQuery.docs){
        if (reqDoc.data().areaName !== data.areaName){
            requests.push(reqDoc.data());
        }
    }
    return requests;
}

//**
//**
//** 
//UPDATE






//**
//**
//** 
//DELETE