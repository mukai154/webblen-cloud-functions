import * as admin from 'firebase-admin'

const database = admin.firestore();
const messagingAdmin = admin.messaging();

const comRef = database.collection('locations');
const userRef = database.collection('webblen_user');
const userNotifRef = database.collection('user_notifications');

//Community Notif Actions
export async function acceptCommunityInvite(data: any, context: any) {
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    console.log(data.areaName);
    console.log(data.comName);
    if (comDoc.exists) {
        //Update Com Data
        let memberIDs = [];
        const comData = comDoc.data()!;
        memberIDs = comData.memberIDs;
        memberIDs.push(data.uid);
        let comStatus = comData.status;
        let activityCount = comData.activityCount;
        if (memberIDs.length >= 3) {
            comStatus = 'active';
        }
        activityCount = activityCount + 1;
        await comRef.doc(data.areaName).collection('communities').doc(data.comName).update({
            'memberIDs': memberIDs,
            'activityCount': activityCount,
            'status': comStatus,
        });
    }
    await userNotifRef.doc(data.notifKey).delete();
    return true;
}

//Friend Notif Actions
export async function acceptFriendRequest(data: any, context: any) {
    const requesterDoc = await userRef.doc(data.requesterUID).get();
    const receiverDoc = await userRef.doc(data.receiverUID).get();
    const requesterData = requesterDoc.data()!.d;
    const receiverData = receiverDoc.data()!.d;
    const requesterFriends = requesterData.friends;
    const receiverFriends = receiverData.friends;
    requesterFriends.push(data.receiverUID);
    receiverFriends.push(data.requesterUID);
    await userRef.doc(data.requesterUID).update({
        'd.friends': requesterFriends
    });
    await userRef.doc(data.receiverUID).update({
        'd.friends': receiverFriends
    });
    if (data.notifKey.length > 0) {
        await userNotifRef.doc(data.notifKey).delete();
    }

    return true;
}

export async function newFollowerNotification(event: any) {

    const prevUserData = event.before.data().d;
    const newUserData = event.after.data().d;
    const messageTokens = [];

    const messageToken = newUserData.messageToken;
    messageTokens.push(messageToken);

    const prevFollowers = prevUserData.followers;
    const newFollowers = newUserData.followers;

    let newFollower;

    for (const uid of newFollowers) {
        if (!prevFollowers.includes(uid)) {
            newFollower = uid;
        }
    }

    if (newFollower === null) {
        return;
    }

    console.log(newFollower);


    const userDoc = await userRef.doc(newFollower).get();
    const userData = userDoc.data()!.d;
    const userUID = userData.uid;
    const username = userData.username;
    const userImgURL = userData.profile_pic;

    const payload = {
        notification: {
            title: "You Have a New Follower!",
            body: "@" + username + " has started following you",
            badge: "1",
        },
        data: {
            "TYPE": "user",
            "DATA": ""
        }
    };

    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    await admin.firestore().doc("user_notifications/" + notifKey).create({
        messageToken: messageToken,
        notificationData: userImgURL,
        notificationTitle: username,
        notificationDescription: "started following you",
        notificationExpirationDate: notifExp.toString(),
        notificationExpDate: notifExp,
        notificationKey: notifKey,
        notificationSeen: false,
        notificationSender: userUID,
        sponsoredNotification: false,
        notificationType: 'user',
        uid: newUserData.uid
    });
    return messagingAdmin.sendToDevice(messageTokens, payload).catch(function onError(error: any) {
        console.log(error);
    });;
}

export async function denyFriendRequest(data: any, context: any) {
    await userNotifRef.doc(data.notifKey).delete();
    return true;
}

// Chat Notif Actions
export async function sendMessageReceivedNotification(event: any) {

    const messageTokens: any[] = [];
    let notificationBody = '';
    const chatChannel = event.after.data();
    const lastMessagePreview = chatChannel.lastMessagePreview;
    const lastMessageSentBy = chatChannel.lastMessageSentBy;
    const usersInChat = chatChannel.users;
    const lastMessageType = chatChannel.lastMessageType;

    for (const uid of usersInChat) {
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        const userToken = userDocData.messageToken;
        const username = userDocData.username;

        if (lastMessageSentBy !== username) {
            messageTokens.push(userToken);
        }
    }

    const notificationTitle = 'New Message from @' + lastMessageSentBy;
    if (lastMessageType === 'image') {
        notificationBody = 'Image';
    } else if (lastMessageType === 'text') {
        notificationBody = lastMessagePreview;
    }

    const payload = {
        notification: {
            title: notificationTitle,
            body: notificationBody,
            badge: "1"
        },
        data: {
            TYPE: 'newMessage',
            DATA: ""
        }
    };

    await messagingAdmin.sendToDevice(messageTokens, payload);
    return;
}

// Post Notif Actions
export async function sendPostCommentNotification(data: any, context: any) {

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

export async function sendPostCommentReplyNotification(data: any, context: any) {

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

