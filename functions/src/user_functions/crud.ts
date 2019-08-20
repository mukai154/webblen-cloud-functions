import * as admin from 'firebase-admin'
import * as geo from 'geofirestore'
const database = admin.firestore();
const geofirestore = new geo.GeoFirestore(database);
const userGeoRef = geofirestore.collection('webblen_user');
const userRef = admin.firestore().collection('webblen_user');
const postsRef = admin.firestore().collection('community_news');
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

export async function getNearbyUsers(data: any, context: any){
    const usersData = [];
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await userGeoRef.near({center: geoPoint, radius: 10}).get();
    for (const doc of query.docs){
        usersData.push(doc.data());
    }
    console.log(usersData.length);
    return usersData;
}

export async function getNumberOfNearbyUsers(data: any, context: any){
    let num = 0;
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await userGeoRef.near({center: geoPoint, radius: 10}).get();
    if (!query.empty){
        num = query.docs.length;
    }
    return num;
}

export async function get10RandomUsers(data: any, context: any){
    const usersData = [];
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await userGeoRef.near({center: geoPoint, radius: 10}).get();
    if (query.docs.length <= 10){
        for (const doc of query.docs){
            usersData.push(doc.data());
        }  
    } else {
        const docs = query.docs;
        for (let i = docs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [docs[i], docs[j]] = [docs[j], docs[i]];
        }
        for (let i = 1; i < 10; i++){
            usersData.push(docs[i].data());
        }  
        
    }
    return usersData;
}

export async function getUsersFromList(data: any, context: any){
    const usersData = [];
    const userIDs = data.userIDs;
    for (const uid of userIDs){
        const userDoc = await userRef.doc(uid).get();
        if (userDoc.exists){
            usersData.push(userDoc.data()!.d)
        }
    }
    return usersData;
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
    const userDoc = await userRef.doc(uid);
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
    const userDoc = await userRef.doc(uid);
    return userDoc.update({
        'd.notifyHotEvents': data.notifyHotEvents,
        'd.notifyFlashEvents': data.notifyFlashEvents,
        'd.notifyFriendRequests': data.notifyFriendRequests,
        'd.notifySuggestedEvents': data.notifySuggestedEvents,
        'd.notifyWalletDeposits': data.notifyWalletDeposits,
        'd.notifyNewMessages': data.notifyNewMessages,
    });
}


//**
//**
//** 
//DELETE
