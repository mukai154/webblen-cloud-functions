import * as admin from 'firebase-admin'
const messagingAdmin = admin.messaging();
//const database = admin.firestore();
const userRef = admin.firestore().collection('webblen_user');
//const transRef = admin.firestore().collection('transactions');


export async function sendTransactionRefNotif(event: any){

    const messageTokens: any[] = [];
    const prevTransData = event.before.data();
    const newTransData = event.after.data();

    if (prevTransData.status === 'pending' && newTransData.status === 'complete'){
        const uid = newTransData.transactionUserUid;
        const userDoc = await userRef.doc(uid).get();
        const userDocData = userDoc.data()!.d;
        const userToken = userDocData.messageToken;
        if ((userToken !== undefined && userToken !== null) && userToken.length > 0){
            if (!messageTokens.includes(userToken)){
                messageTokens.push(userToken);
                
            }
        }
    }

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