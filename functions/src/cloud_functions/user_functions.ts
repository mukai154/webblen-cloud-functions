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
export async function getUserByID(data: any, context: any) {
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    return userDoc.data()!.d;
}

export async function haveEveryoneFollowWebblen(data: any, context: any) {
    const userQuery = await userRef.get();
    const userDocs = userQuery.docs;

    const webblenDoc = await userRef.doc("EtKiw3gK37QsOg6tPBnSJ8MhCm23").get();
    const webblenData = webblenDoc.data()!;
    const webblenFollowers = webblenData.d.followers;

    for (const userDoc of userDocs) {
        const id = userDoc.id;
        const userData = userDoc.data().d;
        let userFollowing = [];
        if (userData.following === undefined || userData.following === null) {
            userFollowing = [];
        } else {
            userFollowing = userData.following;
        }
        if (!userFollowing.includes("EtKiw3gK37QsOg6tPBnSJ8MhCm23")) {
            userFollowing.push("EtKiw3gK37QsOg6tPBnSJ8MhCm23");
            await userRef.doc(id).update({ "d.following": userFollowing });
        }
        if (!webblenFollowers.includes(id)) {
            webblenFollowers.push(id);
            await userRef.doc("EtKiw3gK37QsOg6tPBnSJ8MhCm23").update({ "d.followers": webblenFollowers });
        }
    }
}

export async function getUsername(data: any, context: any) {
    let username = '';
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    username = userDoc.data()!.d.username;
    return username
}

export async function getUserByName(data: any, context: any) {
    const userSnapshots = await userRef.where('d.username', '==', data.username).get();
    if (!userSnapshots.docs) {
        return
    }
    const userDoc = userSnapshots.docs[0];
    return userDoc.data().d;
}

export async function getUserProfilePicURL(data: any, context: any) {
    let profilePicURL = '';
    const uid = data.uid;
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!.d;
    profilePicURL = userData.profile_pic;
    return profilePicURL
}


export async function getUsersFromList(data: any, context: any) {
    const usersData = [];
    const userIDs = data.userIDs;
    for (const uid of userIDs) {
        const userDoc = await userRef.doc(uid).get();
        if (userDoc.exists) {
            if (userDoc.data()!.d !== undefined) {
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
export async function updateUserCheckIn(data: any, context: any) {
    const uid = data.uid;
    const userDoc = await userRef.doc(uid);
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    return userDoc.update({
        'd.lastCheckInTimeInMilliseconds': data.checkInTimeInMilliseconds,
        'l': geoPoint,
    });
}
export async function updateUserProfilePic(data: any, context: any) {
    const userDoc = await userRef.doc(data.uid);
    const postQuery = await postsRef.where('username', '==', data.username).get();
    if (postQuery.docs.length > 0) {
        for (const postDoc of postQuery.docs) {
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

export async function updateUserNotifPreferences(data: any, context: any) {
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







//**
//**
//** 
//DELETE
