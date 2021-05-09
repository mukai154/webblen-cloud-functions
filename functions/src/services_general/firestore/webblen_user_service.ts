import * as admin from 'firebase-admin'

const userRef = admin.firestore().collection('webblen_users');

export async function getFollowersToNotify(uid: any){
    const ids = [];
    const userDoc = await userRef.doc(uid).get();
    const userData = userDoc.data()!;
    const followers = userData.followers; 
    let mutedBy = [];

    if (userData.mutedBy !== undefined && userData.mutedBy !== null){
        mutedBy = userData.muted;
    }

    for (const id of followers){
        if (!mutedBy.includes(id)){
            ids.push(id);
        } 
    }

    return ids;
}

export async function getUsername(uid: any) {
    const userDoc = await userRef.doc(uid).get();
    const username = userDoc.data()!.username;
    return username
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
