import * as admin from 'firebase-admin'
const database = admin.firestore();
const newPostsRef = database.collection('community_news');
const locRef = database.collection('locations');
// const pastEventsRef = database.collection('past_events');


//**
//**
//** 
//CREATE

//**
//**
//** 
//READ


export async function getCommunityNewsPosts(data: any, context: any){
    const posts = [];
    const postQuery = await newPostsRef
    .where('areaName', '==', data.areaName)
    .where('communityName', '==', data.comName)
    .get();
    for (const postDoc of postQuery.docs){
        console.log(postDoc.data());
        posts.push(postDoc.data());
    }
    console.log(posts);
    return posts;
}

export async function getUserNewsPostFeed(data: any, context: any){
    const posts = [];
    const comData = data.userComs;
    const areaNames = Object.keys(comData);
    for (const areaName of areaNames){
        const comNames = comData[areaName];
        for (const comName of comNames){
            const postQuery = await newPostsRef
            .where('areaName', '==', areaName)
            .where('communityName', '==', comName)
            .get();
            for (const postDoc of postQuery.docs){
                console.log(postDoc.data());
                posts.push(postDoc.data());
            }
        }
    }
    console.log(posts);
    return posts;
}

export async function getNewsFeed(data: any, context: any){
    const posts = [];
    const locations = [];
    const locQuery = await locRef.get();
    for (const locDoc of locQuery.docs){
        locations.push(locDoc.id);
    }
    for (const loc of locations){
        const comQuery = await locRef.doc(loc).collection('communities').where('memberIDs', 'array-contains', data.uid).get();
        for (const comDoc of comQuery.docs){
            const comData = comDoc.data();
            const postQuery = await newPostsRef
            .where('areaName', '==', comData.areaName)
            .where('communityName', '==', comData.name)
            .get();
            for (const postDoc of postQuery.docs){
                console.log(postDoc.data());
                posts.push(postDoc.data());
            }
        }
    }
    return posts;
}


//**
//**
//** 
//UPDATE






//**
//**
//** 
//DELETE