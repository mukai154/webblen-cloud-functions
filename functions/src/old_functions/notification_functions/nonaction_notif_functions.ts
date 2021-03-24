import * as admin from 'firebase-admin'

const database = admin.firestore();
const messagingAdmin = admin.messaging();

const userRef = admin.firestore().collection('webblen_user');
const eventRef = admin.firestore().collection('events');
const userNotifRef = database.collection('user_notifications');

export async function sendDailyNotification(event: any) {
    return;
    // const ranNum = Math.floor(Math.random() * Math.floor(10));
    // if (ranNum >= 6){
    //     return;
    // } else {
    //     const notifTitles = [
    //         "We found some events just for you 🎉",
    //         "Want to mix up your day?",
    //         "There's stuff happening we think you'd like...",
    //         "You never know who you're going to meet 👀",
    //         "Don't stay in 🐢 There's so much happening!",
    //         "Don't be boring 😴"
    //     ];

    //     const notifDescriptions = [
    //         "See what events are happening",
    //         "Check in to one of these events",
    //         "Find an event. Check in. Get paid. Simple as that.",
    //         "You never know what you'll find at these events.",
    //         "So don't stay in. Get out there!",
    //         "See these events we have for you.",
    //         "You'll be a lot happier if you decide to get out there.",
    //     ];

    //     const areaNames: any[] = [];
    //     const messageTokens: any[] = [];
    //     const locQuery = await locRef.get();
    //     for (const locDoc of locQuery.docs){
    //         areaNames.push(locDoc.id);
    //     }

    //     for (const areaName of areaNames){
    //         const eventsQuery = await eventsRef.where('d.communityAreaName', '==', areaName).get();
    //         if (eventsQuery.docs.length >= 5){
    //             const ranEventRefData = eventsQuery.docs[4].data();
    //             const lat = ranEventRefData.l.latitude;
    //             const lon = ranEventRefData.l.longitude;
    //             const geoPoint = new admin.firestore.GeoPoint(lat, lon);
    //             const userQuery = await userGeoRef.near({center: geoPoint, radius: 20}).get();
    //             if (!userQuery.empty){
    //                for (const userDoc of userQuery.docs){
    //                 const userDocData = userDoc.data();
    //                 const userToken = userDocData.messageToken;
    //                 if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
    //                     if (!messageTokens.includes(userToken)){
    //                         messageTokens.push(userToken);
    //                     }
    //                 }
    //                }         
    //             }
    //         }
    //     }
    //                const payload = {
    //                     notification: {
    //                         title: notifTitles[ranNum],
    //                         body: notifDescriptions[ranNum],
    //                         badge: "1"
    //                     },
    //                     data: {
    //                         TYPE: '',
    //                         DATA: ""
    //                     }
    //                 };   
    //     await messagingAdmin.sendToDevice(messageTokens, payload);
    // }

}

export async function sendDailyEveningNotification(event: any) {
    return;
    // const ranNum = Math.floor(Math.random() * Math.floor(9));
    // if (ranNum >= 4){
    //     return;
    // } else {
    //     const notifTitles = [
    //         "No Plans Tonight? 🤔",
    //         "Feeling Hungry? 🍛 ",
    //         "Just another boring evening? 😪",
    //     ];

    //     const notifDescriptions = [
    //         "Let's see what's happening",
    //         "We've got some food deals for ya!",
    //         "Let's add some spice to your night",
    //     ];

    //     const areaNames: any[] = [];
    //     const messageTokens: any[] = [];
    //     const locQuery = await locRef.get();
    //     for (const locDoc of locQuery.docs){
    //         areaNames.push(locDoc.id);
    //     }

    //     for (const areaName of areaNames){
    //         const eventsQuery = await eventsRef.where('d.communityAreaName', '==', areaName).get();
    //         if (eventsQuery.docs.length >= 5){
    //             const ranEventRefData = eventsQuery.docs[4].data();
    //             const lat = ranEventRefData.l.latitude;
    //             const lon = ranEventRefData.l.longitude;
    //             const geoPoint = new admin.firestore.GeoPoint(lat, lon);
    //             const userQuery = await userGeoRef.near({center: geoPoint, radius: 20}).get();
    //             if (!userQuery.empty){
    //                for (const userDoc of userQuery.docs){
    //                 const userDocData = userDoc.data();
    //                 const userToken = userDocData.messageToken;
    //                 if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
    //                     if (!messageTokens.includes(userToken)){
    //                         messageTokens.push(userToken);
    //                     }
    //                 }
    //                }         
    //             }
    //         }
    //     }

    //                const payload = {
    //                     notification: {
    //                         title: notifTitles[ranNum],
    //                         body: notifDescriptions[ranNum],
    //                         badge: "1"
    //                     },
    //                     data: {
    //                         TYPE: '',
    //                         DATA: ""
    //                     }
    //                 };   
    //     await messagingAdmin.sendToDevice(messageTokens, payload);
    // }    

}

export async function deleteOldNotifications(event: any) {
    const dateInMillisecondsFiveDaysAgo = Date.now() - 432000000;
    const userNotifQuery = await userNotifRef.get();
    for (const userNotifDoc of userNotifQuery.docs) {
        const userNotifData = userNotifDoc.data();
        const notifExpDate = userNotifData.notificationExpDate;
        if (notifExpDate < dateInMillisecondsFiveDaysAgo) {
            await userNotifRef.doc(userNotifDoc.id).delete();
        }
    }
}

export async function sendTransactionRefNotif(event: any) {

    const messageTokens: any[] = [];
    const prevTransData = event.before.data();
    const newTransData = event.after.data();

    if (prevTransData.status === 'pending' && newTransData.status === 'complete') {
        const uid = newTransData.uid;
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        const userToken = userDocData.messageToken;
        if ((userToken !== undefined && userToken !== null) && userToken.length > 0) {
            if (!messageTokens.includes(userToken)) {
                messageTokens.push(userToken);

            }
        }
    }

    const title = "";
    console.log(title);



    const payload = {
        notification: {
            title: "Your Payout is Complete! 💸",
            body: newTransData.transactionDescription,
            badge: "1"
        },
        data: {
            TYPE: '',
            DATA: ""
        }
    };

    await messagingAdmin.sendToDevice(messageTokens, payload);
}

export async function userDepositNotification(event: any) {

    const prevUserData = event.before.data().d;
    const newUserData = event.after.data().d;

    const messageToken = newUserData.messageToken;
    const notifyDeposits = newUserData.notifyWalletDeposits;

    const prevPoints = prevUserData.eventPoints;
    const newPoints = newUserData.eventPoints;

    if (newPoints < prevPoints || newPoints === prevPoints) {
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
            "DATA": pointDifference.toString()
        }
    };

    if (notifyDeposits) {
        await messagingAdmin.sendToDevice(messageToken, payload);
    }

    await admin.firestore().doc("webblen_user/" + newUserData.uid).update({
        canDisplayDepositAnimation: true,
    });

    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
    const notifExp = new Date().getTime() + 1209600000;
    return admin.firestore().doc("user_notifications/" + notifKey).create({
        messageToken: messageToken,
        notificationData: pointDifference.toString(),
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

export async function notifyFollowersStreamIsLive(data: any) {
    const messageTokens: any[] = [];
    const eventID = data.eventID;
    const uid = data.uid;

    const eventDoc = await eventRef.doc(eventID).get();
    const eventData = eventDoc.data()!.d;

    if (eventData.privacy === "public") {
        const userDoc = await userRef.doc(uid).get();
        const userData = userDoc.data()!.d;
        const username = userData.username;
        const followers = userData.followers;

        const currentTimeInMilli = new Date().getTime();
        const notifTimingLimit = currentTimeInMilli - 3600000;


        for (const follower of followers) {
            console.log(follower);
            const followerDoc = await userRef.doc(follower).get();
            if (followerDoc.exists) {
                let hasPermissionToNotify;
                const followerNotifData = followerDoc.data()!;
                if (followerNotifData.notifyNearbyLiveStreams === null || followerNotifData.notifyNearbyLiveStreams === true) {
                    hasPermissionToNotify = true;
                } else {
                    hasPermissionToNotify = false;
                }
                const followerData = followerDoc.data()!.d;
                const followerID = followerData.uid;
                const followerToken = followerData.messageToken;
                if (followerToken !== null && followerToken.length > 0 && followerNotifData.lastNotificationTimeInMilliseconds !== null && followerNotifData.lastNotificationTimeInMilliseconds < notifTimingLimit && hasPermissionToNotify) {
                    messageTokens.push(followerToken);
                    await admin.firestore().doc("webblen_user/" + followerID).update({
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

        for (const zipcode of eventData.nearbyZipcodes) {
            const userQuery = await userRef.where("lastSeenZipcode", '==', zipcode).get();
            for (const doc of userQuery.docs) {
                const id = userDoc.id;
                const docData = doc.data().d;
                if (docData.messageToken !== null && !messageTokens.includes(docData.messageToken)) {
                    messageTokens.push(docData.messageToken);
                    const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                    const notifExp = new Date().getTime() + 1209600000;
                    await admin.firestore().doc("user_notifications/" + notifKey).create({
                        messageToken: docData.messageToken,
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
                        uid: id
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

        await messagingAdmin.sendToDevice(messageTokens, payload).catch(function onError(error: any) {
            console.log(error);
        });;
    }
    return;
}

export async function notifyUsersOfSpecificEvent(data: any, context: any) {
    const userQuery = await userRef.get();
    const userDocs = userQuery.docs;
    for (const userDoc of userDocs) {
        const id = userDoc.id;
        const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
        const notifExp = new Date().getTime() + 1209600000;
        await admin.firestore().doc("user_notifications/" + notifKey).create({
            messageToken: "",
            notificationData: "s54pnl111Vy0",
            notificationTitle: "@kidvision is live!",
            notificationDescription: "Watch his concert now",
            notificationExpirationDate: notifExp.toString(),
            notificationExpDate: notifExp,
            notificationKey: notifKey,
            notificationSeen: false,
            notificationSender: '',
            sponsoredNotification: false,
            notificationType: 'event',
            uid: id
        });
    }
}

export async function notifyUsersOfNewPost(data: any) {
    const usersToNotify: any[] = [];
    const postID = data.id;
    const authorID = data.authorID;
    const postFollowers = data.followers;
    const postZipcodes = data.nearbyZipcodes;
    const authorDoc = await userRef.doc(authorID).get();
    const authorData = authorDoc.data()!.d;
    const authorUsername = authorData.username;
    const currentTimeInMilli = new Date().getTime();
    //const notifTimingLimit = currentTimeInMilli - 14400000; //Time 4 hours ago in milliseconds

    const payload = {
        notification: {
            title: "@" + authorUsername + " created a new post",
            body: 'Check it Out!',
            badge: "1"
        },
        data: {
            TYPE: 'post',
            DATA: postID,
        }
    }
    //GET POST FOLLOWERS
    for (const id of postFollowers) {
        console.log(id);
        usersToNotify.push(id);
    }

    //GET USERS IN AREA
    for (const zipcode of postZipcodes) {
        const query = await userRef.where("lastSeenZipcode", '==', zipcode).get();
        for (const doc of query.docs) {
            if (!usersToNotify.includes(doc.id)) {
                usersToNotify.push(doc.id);
            }
        }
    }

    for (const id of usersToNotify) {
        const doc = await userRef.doc(id).get();
        if (doc.exists) {
            try {
                try {
                    await messagingAdmin.sendToDevice([doc.data()!.d.messageToken], payload);
                } catch (e) {
                    console.log(e);
                }
                await admin.firestore().doc("webblen_user/" + id).update({
                    lastNotificationTimeInMilliseconds: currentTimeInMilli,
                });
                const notifKey = (Math.floor(Math.random() * 9999999999) + 1).toString();
                const notifExp = new Date().getTime() + 1209600000;
                await admin.firestore().doc("user_notifications/" + notifKey).create({
                    messageToken: "",
                    notificationData: postID,
                    notificationTitle: "@" + authorUsername + " created a new post",
                    notificationDescription: 'Check it Out!',
                    notificationExpirationDate: notifExp.toString(),
                    notificationExpDate: notifExp,
                    notificationKey: notifKey,
                    notificationSeen: false,
                    notificationSender: '',
                    sponsoredNotification: false,
                    notificationType: 'post',
                    uid: id
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    return;
}