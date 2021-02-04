import * as admin from 'firebase-admin'

const database = admin.firestore();
const postsRef = database.collection('posts');
const commentsRef = database.collection('comments');
const userRef = admin.firestore().collection('webblen_user');

export async function distributePostPoints(event: any) {
    const dateTimeOneWeekAgo = Date.now() - 604800000;
    const postSnapshots = await postsRef
        .where('paidOut', '==', false)
        .where('postDateTimeInMilliseconds', '<=', dateTimeOneWeekAgo)
        .get();
    for (const postDoc of postSnapshots.docs) {
        const commenters = [];
        const commentsSnapshots = await commentsRef.doc(postDoc.id).collection('comments').get();
        for (const commentDoc of commentsSnapshots.docs) {
            const commentData = commentDoc.data();
            const commenterID = commentData.senderUID;
            commenters.push(commenterID);
        }
        for (const uid of commenters) {
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!.d;
            let ap = userData.ap;
            if (ap <= 5.00) {
                ap = ap + 0.02;
            }
            const pay = 0.5 + (ap * commenters.length);
            const newPointVal = userData.eventPoints + pay;
            await userRef.doc(uid).update({ "d.ap": ap, "d.eventPoints": newPointVal });
        }
        await postsRef.doc(postDoc.id).update({ 'paidOut': true });
    }
}