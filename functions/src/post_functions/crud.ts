import * as admin from 'firebase-admin'

const messagingAdmin = admin.messaging();
const userRef = admin.firestore().collection('webblen_user');

export async function sendPostCommentNotification(data: any, context: any){

    const messageTokens = [];
    const postID = data.postID;
    const postAuthorID = data.postAuthorID;
    const commenterID = data.commenterID;
    const commentBody = data.commentBody;
 
    const authorDoc = await userRef.doc(postAuthorID).get();
    const authorData = authorDoc.data()!.d;
    const authorMessageToken = authorData.messageToken;
    messageTokens.push(authorMessageToken);

    const commenterDoc = await userRef.doc(commenterID).get();
    const commenterData = commenterDoc.data()!.d;
    const commenterUsername = "@" + commenterData.username;


    const payload = {
        notification: {
            title: commenterUsername + " commented on your post",
            body: commentBody,
            badge: "1",
        },
        data: {
            "TYPE": "postComment",
            "DATA": postID,
        }
    };
    await messagingAdmin.sendToDevice(messageTokens, payload);
    // if (notifyDeposits){
    //     await messagingAdmin.sendToDevice(messageToken, payload);
    // }
    
    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    return admin.firestore().doc("user_notifications/" + notifKey).create({
        messageToken: messageTokens[0],
        notificationData: postID,
        notificationTitle: commenterUsername + " commented on your post",
        notificationDescription: commentBody,
        notificationExpirationDate: notifExp.toString(),
        notificationExpDate: notifExp,
        notificationKey: notifKey,
        notificationSeen: false,
        notificationSender: '',
        sponsoredNotification: false,
        notificationType: 'post',
        uid: postAuthorID,
    });
}

export async function sendPostCommentReplyNotification(data: any, context: any){


    const messageTokens = [];
    const postID = data.postID;
    //const originalCommentID = data.originalCommentID;
    const originalCommenterID = data.originalCommenterID;

    const commenterID = data.commenterID;
    const commentBody = data.commentBody;
 
    const receiverDoc = await userRef.doc(originalCommenterID).get();
    const receiverData = receiverDoc.data()!.d;
    const receiverToken = receiverData.messageToken;
    messageTokens.push(receiverToken);

    const commenterDoc = await userRef.doc(commenterID).get();
    const commenterData = commenterDoc.data()!.d;
    const commenterUsername = "@" + commenterData.username;


    const payload = {
        notification: {
            title: commenterUsername + " replied to your comment",
            body: commentBody,
            badge: "1",
        },
        data: {
            "TYPE": "postCommentReply",
            "DATA": postID,
        }
    };
    await messagingAdmin.sendToDevice(messageTokens, payload);
    // if (notifyDeposits){
    //     await messagingAdmin.sendToDevice(messageToken, payload);
    // }
    
    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    return admin.firestore().doc("user_notifications/" + notifKey).create({
        messageToken: messageTokens[0],
        notificationData: postID,
        notificationTitle: commenterUsername + " replied to your comment",
        notificationDescription: commentBody,
        notificationExpirationDate: notifExp.toString(),
        notificationExpDate: notifExp,
        notificationKey: notifKey,
        notificationSeen: false,
        notificationSender: '',
        sponsoredNotification: false,
        notificationType: 'post',
        uid: originalCommenterID,
    });
}