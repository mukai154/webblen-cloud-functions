import * as admin from 'firebase-admin'

const messagingAdmin = admin.messaging();
const userRef = admin.firestore().collection('webblen_user');

export async function sendUserNotification(event: any){

    console.log("sendUserNotification Started...");
    
    const messageTokens = [];
    const uid = event.data().uid;
    const userDoc = await userRef.doc(uid).get();
    const token = userDoc.data()!.d.messageToken;
    const notifyFriendRequests = userDoc.data()!.d.notifyFriendRequests;
    console.log(token);
    console.log(uid);
    messageTokens.push(token);
    let notifTitle = "";
    const notifDesc = event.data().notificationDescription;
    const notifType = event.data().notificationType;
    //const notifData = event.data().notifData;
    const notifKey = event.data().notifKey;
    

    console.log("sending user notification to:" + messageTokens);

    if (notifType === "friendRequest"){
        notifTitle = "New Friend Request!";
    } else if (notifType === "communityDisbanded"){
        notifTitle = "Community Disbanded";
    } else if (notifType === "invite"){
        notifTitle = "New Community Invite!";
        notifTitle = event.data().notificationTitle;
        if (event.data().notificationExpDate === null){
            const notifExp = new Date().getTime() + 1209600000;
            await admin.firestore().doc("user_notifications/" + notifKey).update({
                notificationExpDate: notifExp
            });
        }
    } else if (notifType === "eventShare"){
        notifTitle = event.data().notificationTitle;
        if (event.data().notificationExpDate === null){
            const notifExp = new Date().getTime() + 1209600000;
            await admin.firestore().doc("user_notifications/" + notifKey).update({
                notificationExpDate: notifExp
            });
        }
    } else {
        return;
    }

    const userNotifSnapshots = await admin.firestore()
    .collection('user_notificiations')
    .where('uid', '==', uid)
    .where('notificationSeen', '==', false)
    .get();

    const unseenNotifCount = userNotifSnapshots.docs.length.toString();

    console.log(notifTitle);

    const payload = {
        notification: {
            title: notifTitle,
            body: notifDesc,
            badge: unseenNotifCount
        },
        data: {
            "TYPE": 'notification',
            "DATA": ''
        }
    };
    
    if (!notifyFriendRequests && notifType === "friendRequest"){
        return
    } else {
        await messagingAdmin.sendToDevice(messageTokens, payload);
    }
}

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

export async function sendNewCommunityPostNotif(event: any){

    const messageTokens: any[] = [];

    const postData = event.data();
    const authorUsername = postData.author;
    const comAreaName = postData.areaName;
    const comName = postData.communityName;
    const comDocRef = 'locations/' + comAreaName + '/communities/' + comName;
     
    const comDoc = await admin.firestore().doc(comDocRef).get();
    const comDocData = comDoc.data()!;

    const members = comDocData.memberIDs;
    const followers = comDocData.followers;

    for (const uid in members){
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        const username = "@" + userDocData.username;
        if (userDocData && authorUsername !== username){
            const userToken = userDocData.messageToken;
            if (userToken){
                messageTokens.push(userToken);
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: userToken,
                    notificationData: comAreaName + "." + comName,
                    notificationTitle: "New post in " + comAreaName + "/" + comName,
                    notificationDescription: postData.title,
                    notificationExpirationDate: notifExp.toString(),
                    notificationExpDate: notifExp,
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'newPost',
                    uid: userDocData.uid
                });
            }
        }
    }

    for (const uid in followers){
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        if (userDocData){
            const userToken = userDocData.messageToken;
            if (userToken && !messageTokens.includes(userToken)){
                messageTokens.push(userToken);
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: userToken,
                    notificationData: comAreaName + "." + comName,
                    notificationTitle: "New post in " + comAreaName + "/" + comName,
                    notificationDescription: postData.title,
                    notificationExpirationDate: notifExp.toString(),
                    notificationExpDate: notifExp,
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'newPost',
                    uid: userDocData.uid
                });
            }
        }        
    }

    const notifTitle = "New post in " + comAreaName + "/" + comName;
    const notifBody = postData.title;

    const payload = {
        notification: {
            title: notifTitle,
            body: notifBody,
            badge: "1",
        },
        data: {
            "TYPE": "newPost",
            "DATA": postData.postID
        }
    };
    
    await messagingAdmin.sendToDevice(messageTokens, payload);

}

export async function sendNewCommunityEventNotification(event: any){

    console.log("sendNewCommunityEventNotification Started...");
    const messageTokens: any[] = [];

    const eventPostData = event.data();
    const authorUid = eventPostData.authorUid;
    const comAreaName = eventPostData.communityAreaName;
    const comName = eventPostData.communityName;
    const comDocRef = 'locations/' + comAreaName + '/communities/' + comName;
     
    const comDoc = await admin.firestore().doc(comDocRef).get();
    const comDocData = comDoc.data()!;

    const members = comDocData.memberIDs;
    const followers = comDocData.followers;

    for (const uid in members){
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        if (userDocData && uid !== authorUid){
            const userToken = userDocData.messageToken;
            if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
                if (!messageTokens.includes(userToken)){
                    messageTokens.push(userToken);
                }
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: userToken,
                    notificationData: comAreaName + "." + comName,
                    notificationTitle: comAreaName + "/" + comName + " has a new special event happening soon!",
                    notificationDescription: eventPostData.title,
                    notificationExpirationDate: notifExp.toString(),
                    notificationExpDate: notifExp,
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'newEvent',
                    uid: userDocData.uid
                });
            }
        }
    }

    for (const uid in followers){
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        if (userDocData && uid !== authorUid){
            const userToken = userDocData.messageToken;
            if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
                if (!messageTokens.includes(userToken)){
                    messageTokens.push(userToken);
                }
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: userToken,
                    notificationData: comAreaName + "." + comName,
                    notificationTitle: comAreaName + "/" + comName + " has a new special event happening soon!",
                    notificationDescription: eventPostData.title,
                    notificationExpirationDate: notifExp.toString(),
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'newEvent',
                    uid: userDocData.uid
                });
            }
        }        
    }

    const notifTitle = comAreaName + "/" + comName + " has a new special event happening soon!";
    const notifBody = eventPostData.title;

    const payload = {
        notification: {
            title: notifTitle,
            body: notifBody,
            badge: "1",
        },
        data: {
            "TYPE": "newEvent",
            "DATA": comAreaName + "." + comName,
        }
    };
    
    await messagingAdmin.sendToDevice(messageTokens, payload);

    
}

export async function sendCommunityPostCommentNotification(event: any){

    console.log("sendNewPostCommentNotification Started...");
    const messageTokens: any[] = [];

    const commentData = event.data();
    //const commentUID = event.data().uid;
    const commentPostID = commentData.postID;
    const commentUserName = commentData.username;
    const postDocRef = 'community_news/' + commentPostID;
    const postDoc = await admin.firestore().doc(postDocRef).get();
    const postDocData = postDoc.data()!;
    const postTitle = postDocData.title;
    const comName = postDocData.communityName;
    const comAreaName = postDocData.areaName;
    const comDocRef = 'locations/' + comAreaName + '/communities/' + comName;
     
    const comDoc = await admin.firestore().doc(comDocRef).get();
    const comDocData = comDoc.data()!;

    const members = comDocData.memberIDs;
    const followers = comDocData.followers;
    const sentNotif: any[] = [];

    
    for(const uid of members){
        console.log(uid);
        const userDoc = await userRef.doc(uid).get();
        const userData = userDoc.data()!.d;
        console.log(userData); 
        if (userData.lastNotificationTimeInMilliseconds !== undefined){
            //const lastNotifTime = userData.lastNotificationTimeInMilliseconds;
            if (!sentNotif.includes(uid)){
                sentNotif.push(uid);
                messageTokens.push(userData.messageToken);
                    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                    const notifExp = new Date().getTime() + 1209600000;
                    await admin.firestore().doc("user_notifications/" + notifKey).create({
                        messageToken: userData.messageToken,
                        notificationData: comAreaName + "." + comName,
                        notificationTitle: comAreaName + "/" + comName + ": " + postTitle,
                        notificationDescription:  "@" + commentUserName + " made a comment",
                        notificationExpirationDate: notifExp.toString(),
                        notificationExpDate: notifExp,
                        notificationKey: notifKey,
                        notificationSeen: false,
                        notificationSender: postDocData.postID,
                        sponsoredNotification: false,
                        notificationType: 'newPostComment',
                        uid: userData.uid
                    });  
                    // await userRef.doc(uid).update({
                    //     'lastNotificationTimeInMilliseconds': Date.now()
                    // });
                
            }
        } else {
            if (!sentNotif.includes(uid)){
                sentNotif.push(uid);
                messageTokens.push(userData.messageToken);
                    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                    const notifExp = new Date().getTime() + 1209600000;
                    await admin.firestore().doc("user_notifications/" + notifKey).create({
                        messageToken: userData.messageToken,
                        notificationData: comAreaName + "." + comName,
                        notificationTitle: comAreaName + "/" + comName + ": " + postTitle,
                        notificationDescription:  "@" + commentUserName + " made a comment",
                        notificationExpirationDate: notifExp.toString(),
                        notificationExpDate: notifExp,
                        notificationKey: notifKey,
                        notificationSeen: false,
                        notificationSender: postDocData.postID,
                        sponsoredNotification: false,
                        notificationType: 'newPostComment',
                        uid: userData.uid
                    });  
                    // await userRef.doc(uid).update({
                    //     'lastNotificationTimeInMilliseconds': Date.now()
                    // });
                
            }
                // await userRef.doc(uid).update({
                //     'lastNotificationTimeInMilliseconds': Date.now()
                // });
            } 
        }
        
        for (const uid of followers){
            console.log(uid);
            const userDoc = await userRef.doc(uid).get();
            const userData = userDoc.data()!;
            console.log(userData); 
            if (userData.lastNotificationTimeInMilliseconds !== undefined){
                //const lastNotifTime = userData.lastNotificationTimeInMilliseconds;
                if (!sentNotif.includes(uid)){
                    sentNotif.push(uid);
                    messageTokens.push(userData.messageToken);
                        const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                        const notifExp = new Date().getTime() + 1209600000;
                        await admin.firestore().doc("user_notifications/" + notifKey).create({
                            messageToken: userData.messageToken,
                            notificationData: comAreaName + "." + comName,
                            notificationTitle: comAreaName + "/" + comName + ": " + postTitle,
                            notificationDescription:  "@" + commentUserName + " made a comment",
                            notificationExpirationDate: notifExp.toString(),
                            notificationExpDate: notifExp,
                            notificationKey: notifKey,
                            notificationSeen: false,
                            notificationSender: postDocData.postID,
                            sponsoredNotification: false,
                            notificationType: 'newPostComment',
                            uid: userData.uid
                        });  
                        // await userRef.doc(uid).update({
                        //     'lastNotificationTimeInMilliseconds': Date.now()
                        // });
                    
                }
            } else {
                if (!sentNotif.includes(uid)){
                    sentNotif.push(uid);
                    messageTokens.push(userData.messageToken);
                        const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                        const notifExp = new Date().getTime() + 1209600000;
                        await admin.firestore().doc("user_notifications/" + notifKey).create({
                            messageToken: userData.messageToken,
                            notificationData: comAreaName + "." + comName,
                            notificationTitle: comAreaName + "/" + comName + ": " + postTitle,
                            notificationDescription:  "@" + commentUserName + " made a comment",
                            notificationExpirationDate: notifExp.toString(),
                            notificationExpDate: notifExp,
                            notificationKey: notifKey,
                            notificationSeen: false,
                            notificationSender: postDocData.postID,
                            sponsoredNotification: false,
                            notificationType: 'newPostComment',
                            uid: userData.uid
                        });  
                        // await userRef.doc(uid).update({
                        //     'lastNotificationTimeInMilliseconds': Date.now()
                        // });
                    
                }
                    // await userRef.doc(uid).update({
                    //     'lastNotificationTimeInMilliseconds': Date.now()
                    // });
                }  
        }
        const notifTitle = comAreaName + "/" + comName + ": " + postTitle;
        const notifBody = "@" + commentUserName + " made a comment";

        const payload = {
            notification: {
                title: notifTitle,
                body: notifBody,
                badge: "1",
            },
            data: {
                "TYPE": "newPostComment",
                "DATA": postDocData.postID
            }
        };
    
        await messagingAdmin.sendToDevice(messageTokens, payload);
    
    
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


