import * as admin from 'firebase-admin'

const messagingAdmin = admin.messaging();
const userRef = admin.firestore().collection('webblen_user');

export async function userDepositNotification(event: any){

    const prevUserData = event.before.data().d;
    const newUserData = event.after.data().d;

    const messageToken = newUserData.messageToken;
    const notifyDeposits = newUserData.notifyWalletDeposits;    

    const prevPoints = prevUserData.eventPoints;
    const newPoints = newUserData.eventPoints;

    if (newPoints < prevPoints || newPoints === prevPoints){
        return;
    }

    const pointDifference = (newPoints - prevPoints).toFixed(2);

    const payload = {
        notification: {
            title: "You've Earned Webblen!",
            body: pointDifference + " webblen has been deposited in your wallet",
            badge: "1",
        },
        data: {
            "TYPE": "deposit",
            "DATA": ""
        }
    };
    
    if (notifyDeposits){
        await messagingAdmin.sendToDevice(messageToken, payload);
    }
    
    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    return admin.firestore().doc("user_notifications/" + notifKey).create({
        messageToken: messageToken,
        notificationData: "",
        notificationTitle: "New Deposit!",
        notificationDescription: pointDifference + " webblen has been deposited in your wallet",
        notificationExpirationDate: notifExp.toString(),
        notificationExpDate: notifExp,
        notificationKey: notifKey,
        notificationSeen: false,
        notificationSender: '',
        sponsoredNotification: false,
        notificationType: 'deposit',
        uid: newUserData.uid
    });
}

export async function notifyFollowersStreamIsLive(data: any){
    const messageTokens: any[] = [];
    const eventID = data.eventID;
    const uid = data.uid;
   
    const userDoc = await userRef.doc(uid).get();
    const userNotifData = userDoc.data()!;
    const userData = userDoc.data()!.d;
    const username = userData.username;
    const followers = userData.followers;
    
    const currentTimeInMilli = new Date().getTime();
    const notifTimingLimit = currentTimeInMilli - 3600000;
    let hasPermissionToNotify;
    if (userNotifData.notifyNearbyLiveStreams === null || userNotifData.notifyNearbyLiveStreams === true){
        hasPermissionToNotify = true;
    } else {
        hasPermissionToNotify = false;
    }
    
    
    for (const follower of followers){
        console.log(follower);
        const followerDoc = await userRef.doc(follower).get();
        if (followerDoc.exists){
            const followerData = followerDoc.data()!.d;
            const followerID = followerData.uid;
            const followerToken = followerData.messageToken;
            if (followerID === 'uMc074hbM8RqhI0kKqXxDpve9iQ2' || followerID === 'EtKiw3gK37QsOg6tPBnSJ8MhCm23'){
                console.log(followerToken);
                if (userNotifData.lastNotificationTimeInMilliseconds !== null && userNotifData.lastNotificationTimeInMilliseconds < notifTimingLimit && hasPermissionToNotify){
                    messageTokens.push(followerToken);
                    await admin.firestore().doc("webbolen_user/" + followerID).update({
                        lastNotificationTimeInMilliseconds: currentTimeInMilli,
                    });
                }
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: followerToken,
                    notificationData: eventID,
                    notificationTitle: "@" + username + " is Streaming Live",
                    notificationDescription: '',
                    notificationExpirationDate: notifExp.toString(),
                    notificationExpDate: notifExp,
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'event',
                    uid: followerID
                });
        
            }
        }
    }
    

    const payload = {
        notification: {
          title: "@" + username + " is Streaming Live",
          body: "Don't Miss Out!",
          badge: "1"
        },
        data: {
          TYPE: 'event',
          DATA: eventID,
        }
    };

    await messagingAdmin.sendToDevice(messageTokens, payload).catch(function onError(error:any) {
        console.log(error);
      });;
      
    return;
}

export async function newFollowerNotification(event: any){

    const prevUserData = event.before.data().d;
    const newUserData = event.after.data().d;

    const messageToken = newUserData.messageToken;

    const prevFollowers = prevUserData.followers;
    const newFollowers = newUserData.followers;

    let newFollower;

    for (const uid of newFollowers){
        if (!prevFollowers.includes(uid)){
            newFollower = uid;
        }
    }
    
    if (newFollower === null){
        return;
    }

    console.log(newFollower);
    

    const userDoc = await userRef.doc(newFollower).get();
    const userData = userDoc.data()!.d;
    const userUID = userData.uid;
    const username = userData.username;
    const userImgURL = userData.profile_pic;

    if (userData.notifyNewFollowers === null || userData.notifyNewFollowers === true){
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
        await messagingAdmin.sendToDevice(messageToken, payload);
    }

    
    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    return admin.firestore().doc("user_notifications/" + notifKey).create({
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
}

export async function sendMessageReceivedNotification(event: any){

    const messageTokens: any[] = [];
    let notificationBody = '';
    const chatChannel = event.after.data();
    const lastMessagePreview = chatChannel.lastMessagePreview;
    const lastMessageSentBy = chatChannel.lastMessageSentBy;
    const usersInChat = chatChannel.users;
    const lastMessageType = chatChannel.lastMessageType;
    
    for (const uid of usersInChat){
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        const userToken = userDocData.messageToken;
        const username = userDocData.username;
        
        if (lastMessageSentBy !== username){
            messageTokens.push(userToken);
        }
    }

    const notificationTitle = 'New Message from @' + lastMessageSentBy;
    if (lastMessageType === 'image'){
        notificationBody = 'Image';
    } else if (lastMessageType === 'text'){
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


