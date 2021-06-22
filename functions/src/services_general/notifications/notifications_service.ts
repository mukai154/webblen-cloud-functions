import * as admin from 'firebase-admin'

const messagingAdmin = admin.messaging();

export async function sendNotificationToSingleDevice(title: any, body: any,type: any, messageToken: any) {
    console.log('attempting to send notification to: ', messageToken); 
    const payload = {
        notification: {
            title: title,
            body: body,
        },
        token: messageToken
    };
    await messagingAdmin.send(payload).then((res) => {
        console.log('sent notification:', res); 
    }).catch((error) => {
        console.log('error sending notification:', error); 
    });
    return;
}

export async function sendNotificationToMultipleDevices(title: any, body: any, badgeCount: any, type: any, messageTokens: any) {
    let payload;
    for (const messageToken of messageTokens){
        payload = {
            notification: {
                title: title,
                body: body,
            },
            token: messageToken
        };
        await messagingAdmin.send(payload).then((res) => {
            console.log('sent notification:', res); 
        }).catch((error) => {
            console.log('error sending notification:', error); 
        });
    }
    return;
}