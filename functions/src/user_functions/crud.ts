import * as admin from 'firebase-admin'
//const messagingAdmin = admin.messaging();
const userRef = admin.firestore().collection('webblen_user');
const postsRef = admin.firestore().collection('community_news');
//const locRef = admin.firestore().collection('locations');
//const eventsRef = admin.firestore().collection('upcoming_events');

//const locRef = admin.firestore().collection('locations');
//**
//**
//** 
//CREATE

//**
//**
//** 
//READ
export async function getUserByID(data: any, context: any){
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    return userDoc.data()!.d;
}
export async function getUsername(data: any, context: any){
    let username = '';
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    username = userDoc.data()!.d.username;
    return username
}

export async function getUserByName(data: any, context: any){
    const userSnapshots = await userRef.where('d.username', '==', data.username).get();
    if (!userSnapshots.docs){
        return
    } 
    const userDoc = userSnapshots.docs[0];
    return userDoc.data().d;
}

export async function getUserProfilePicURL(data: any, context: any){
    let profilePicURL = '';
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    profilePicURL = userData.profile_pic;
    return profilePicURL
}


export async function getUsersFromList(data: any, context: any){
    const usersData = [];
    const userIDs = data.userIDs;
    for (const uid of userIDs){
        const userDoc = await userRef.doc(uid).get();
        if (userDoc.exists){
            if (userDoc.data()!.d !== undefined){
                usersData.push(userDoc.data()!.d)
            }
        }
    }
    return JSON.stringify(usersData);
}



//**
//**
//** 
//UPDATE
export async function updateUserCheckIn(data: any, context: any){
    const uid = data.uid;
    const userDoc = await userRef.doc(uid);
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    return userDoc.update({
        'd.lastCheckInTimeInMilliseconds': data.checkInTimeInMilliseconds,
        'l': geoPoint,
    });
}
export async function updateUserProfilePic(data: any, context: any){
    const userDoc = await userRef.doc(data.uid);
    const postQuery = await postsRef.where('username', '==', data.username).get();
    if (postQuery.docs.length > 0){
        for (const postDoc of postQuery.docs){
            await postsRef.doc(postDoc.id).update({
                'userImageURL': data.profile_pic
            });
        }
    }
    await userDoc.update({
        'd.profile_pic': data.profile_pic,
    });
    return true;
}

export async function updateUserNotifPreferences(data: any, context: any){
    const uid = data.uid;
    const userDoc = userRef.doc(uid);
    return userDoc.update({
        'd.notifyHotEvents': data.notifyHotEvents,
        'd.notifyFlashEvents': data.notifyFlashEvents,
        'd.notifyFriendRequests': data.notifyFriendRequests,
        'd.notifySuggestedEvents': data.notifySuggestedEvents,
        'd.notifyWalletDeposits': data.notifyWalletDeposits,
        'd.notifyNewMessages': data.notifyNewMessages,
    });
}

export async function sendFriendRequest(data: any, context: any){
    const uid = data.uid;
    const userDoc = userRef.doc(uid);
    return userDoc.update({
        'd.notifyHotEvents': data.notifyHotEvents,
        'd.notifyFlashEvents': data.notifyFlashEvents,
        'd.notifyFriendRequests': data.notifyFriendRequests,
        'd.notifySuggestedEvents': data.notifySuggestedEvents,
        'd.notifyWalletDeposits': data.notifyWalletDeposits,
        'd.notifyNewMessages': data.notifyNewMessages,
    });
}

export async function sendDailyNotification(event: any){
    return;
    // const ranNum = Math.floor(Math.random() * Math.floor(10));
    // if (ranNum >= 6){
    //     return;
    // } else {
    //     const notifTitles = [
    //         "We found some events just for you 🎉",
    //         "Want to mix up your day?",
    //         "There's stuff happening we think you'd like...",
    //         "You never know who you're going to meet 👀",
    //         "Don't stay in 🐢 There's so much happening!",
    //         "Don't be boring 😴"
    //     ];
    
    //     const notifDescriptions = [
    //         "See what events are happening",
    //         "Check in to one of these events",
    //         "Find an event. Check in. Get paid. Simple as that.",
    //         "You never know what you'll find at these events.",
    //         "So don't stay in. Get out there!",
    //         "See these events we have for you.",
    //         "You'll be a lot happier if you decide to get out there.",
    //     ];
    
    //     const areaNames: any[] = [];
    //     const messageTokens: any[] = [];
    //     const locQuery = await locRef.get();
    //     for (const locDoc of locQuery.docs){
    //         areaNames.push(locDoc.id);
    //     }
    
    //     for (const areaName of areaNames){
    //         const eventsQuery = await eventsRef.where('d.communityAreaName', '==', areaName).get();
    //         if (eventsQuery.docs.length >= 5){
    //             const ranEventRefData = eventsQuery.docs[4].data();
    //             const lat = ranEventRefData.l.latitude;
    //             const lon = ranEventRefData.l.longitude;
    //             const geoPoint = new admin.firestore.GeoPoint(lat, lon);
    //             const userQuery = await userGeoRef.near({center: geoPoint, radius: 20}).get();
    //             if (!userQuery.empty){
    //                for (const userDoc of userQuery.docs){
    //                 const userDocData = userDoc.data();
    //                 const userToken = userDocData.messageToken;
    //                 if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
    //                     if (!messageTokens.includes(userToken)){
    //                         messageTokens.push(userToken);
    //                     }
    //                 }
    //                }         
    //             }
    //         }
    //     }
    //                const payload = {
    //                     notification: {
    //                         title: notifTitles[ranNum],
    //                         body: notifDescriptions[ranNum],
    //                         badge: "1"
    //                     },
    //                     data: {
    //                         TYPE: '',
    //                         DATA: ""
    //                     }
    //                 };   
    //     await messagingAdmin.sendToDevice(messageTokens, payload);
    // }

}

export async function sendDailyEveningNotification(event: any){
    return;
    // const ranNum = Math.floor(Math.random() * Math.floor(9));
    // if (ranNum >= 4){
    //     return;
    // } else {
    //     const notifTitles = [
    //         "No Plans Tonight? 🤔",
    //         "Feeling Hungry? 🍛 ",
    //         "Just another boring evening? 😪",
    //     ];
    
    //     const notifDescriptions = [
    //         "Let's see what's happening",
    //         "We've got some food deals for ya!",
    //         "Let's add some spice to your night",
    //     ];
    
    //     const areaNames: any[] = [];
    //     const messageTokens: any[] = [];
    //     const locQuery = await locRef.get();
    //     for (const locDoc of locQuery.docs){
    //         areaNames.push(locDoc.id);
    //     }
    
    //     for (const areaName of areaNames){
    //         const eventsQuery = await eventsRef.where('d.communityAreaName', '==', areaName).get();
    //         if (eventsQuery.docs.length >= 5){
    //             const ranEventRefData = eventsQuery.docs[4].data();
    //             const lat = ranEventRefData.l.latitude;
    //             const lon = ranEventRefData.l.longitude;
    //             const geoPoint = new admin.firestore.GeoPoint(lat, lon);
    //             const userQuery = await userGeoRef.near({center: geoPoint, radius: 20}).get();
    //             if (!userQuery.empty){
    //                for (const userDoc of userQuery.docs){
    //                 const userDocData = userDoc.data();
    //                 const userToken = userDocData.messageToken;
    //                 if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
    //                     if (!messageTokens.includes(userToken)){
    //                         messageTokens.push(userToken);
    //                     }
    //                 }
    //                }         
    //             }
    //         }
    //     }
    
    //                const payload = {
    //                     notification: {
    //                         title: notifTitles[ranNum],
    //                         body: notifDescriptions[ranNum],
    //                         badge: "1"
    //                     },
    //                     data: {
    //                         TYPE: '',
    //                         DATA: ""
    //                     }
    //                 };   
    //     await messagingAdmin.sendToDevice(messageTokens, payload);
    // }    

}


//**
//**
//** 
//DELETE
