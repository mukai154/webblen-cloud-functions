import * as admin from 'firebase-admin'

const database = admin.firestore();
const postsRef = database.collection('posts');
const commentsRef = database.collection('comments');
const userRef = database.collection('webblen_users');
const notificationsRef = database.collection('webblen_notifications');

export async function createNotificationForWebblenPost(post: any, authorUsername: any){
    console.log('creating post notification...');
    const header = "@" + authorUsername + " Created a New Post";
    const subHeader = "Check it Out";
    const type = "post";
    const read = false;
    const senderUID = post.authorID;
    const timePostedInMilliseconds = new Date().getTime();
    const expDateInMilliseconds = timePostedInMilliseconds + 1209600000; //post expires in 3 months
    
    //send notification to suggested users 
    for (const uid of post.suggestedUIDs) {
        
        const currentDateInMilliseconds = new Date().getTime();
        const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();

        await notificationsRef.doc(notifKey).set({
            'header': header,
            'subHeader': subHeader,
            'type': type,
            'read': read,
            'receiverUID': uid,
            'senderUID': senderUID,
            'expDateInMilliseconds': expDateInMilliseconds,
            'timePostedInMilliseconds': currentDateInMilliseconds,
            'additionalData': {
                'id': post.id,
            }
        });
    }
}

export async function distributePostPoints() {
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
            const newBalance = userData.WBLN + pay;
            await userRef.doc(uid).update({ "ap": ap, "WBLN": newBalance });
        }
        await postsRef.doc(postDoc.id).update({ 'paidOut': true });
    }
}