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

export async function followWebblen(uid: any) {
    const webblenDocRef = userRef.doc("EtKiw3gK37QsOg6tPBnSJ8MhCm23");
    await webblenDocRef.update({'followers': admin.firestore.FieldValue.arrayUnion(uid)});
    await userRef.doc(uid).update({'following': admin.firestore.FieldValue.arrayUnion("EtKiw3gK37QsOg6tPBnSJ8MhCm23")});
}

export async function haveEveryoneFollowWebblen() {
    const userQuery = await userRef.get();
    const userDocs = userQuery.docs;
    const webblenDocRef = userRef.doc("EtKiw3gK37QsOg6tPBnSJ8MhCm23");

    for (const userDoc of userDocs) {
        const id = userDoc.id;
        await webblenDocRef.update({'followers': admin.firestore.FieldValue.arrayUnion(id)});
        await userRef.doc(id).update({'following': admin.firestore.FieldValue.arrayUnion("EtKiw3gK37QsOg6tPBnSJ8MhCm23")});
    }
}
