import * as admin from 'firebase-admin';

const database = admin.firestore();
const platformDocRef = database.collection('app_release_info').doc('general');
const stripeDocRef = database.collection('app_release_info').doc('stripe');
const stripeConnectAccountRef = database.collection('stripe');

export async function createWebblenStripeConnectAccount(req: any, res: any){
    //request data
    const requestData = req.query;
    const uid = requestData.uid;
    const country = requestData.country;

    //get platform maintenance status
    const platformData = await platformDocRef.get();
    const underMaintenance = await platformData.data()!.underMaintenance;
    
    //stripe info
    const stripeData = await stripeDocRef.get();
    let stripeSecretKey;

    //get testing key if platform is under maintenance
    if (underMaintenance){
        stripeSecretKey = stripeData.data()!.testSecretKey;
    } else {
        stripeSecretKey = stripeData.data()!.secretKey;
    }
    const stripe = require('stripe')(stripeSecretKey);
    let stripeUID;

    //check for existing account
    const userStripeConnectAccountDoc = await stripeConnectAccountRef.doc(uid).get();
    if (userStripeConnectAccountDoc.exists){
        stripeUID = userStripeConnectAccountDoc.data()!.stripeUID;
    } else {
        const newStripeAcct = await stripe.accounts.create({
              type: 'custom',
              country: country,
              requested_capabilities: [
                'card_payments',
                'transfers',
              ],
              settings: {
                  payouts: {
                    schedule: {
                        delay_days: 2,
                        interval: "weekly",
                        weekly_anchor: "monday",
                    }
                  },
              }
            });
        //update new stripe account info in database
        stripeUID = newStripeAcct.id;
        await admin.firestore().collection('stripe').doc(uid).set({
            "stripeUID": stripeUID,
            "verified": "incomplete",
            "actionRequired": true,
            "availableBalance": 0.0001,
            "pendingBalance": 0.0001,
        });
    }

    const stripeAccountLinkResponse = await stripe.accountLinks.create({
          account: stripeUID,
          failure_url: 'https://webblen.io/earnings-failed',
          success_url: 'https://us-central1-webblen-events.cloudfunctions.net/completeCreateWebblenStripeConnectAccount?uid=' + uid,
          type: 'custom_account_verification',
          collect: 'eventually_due',
        });

    //redirect to stripe onboarding form
    res.redirect(stripeAccountLinkResponse.url);
}

export async function completeCreateWebblenStripeConnectAccount(req: any, res: any){
    //request data
    const requestData = req.query;
    const uid = requestData.uid;

    //update stripe account data
    await admin.firestore().collection('stripe').doc(uid).update({
        "actionRequired": false,
        "verified": "pending",
    });

    //redirect to completed page
    res.redirect('https://webblen.io/earnings-success');
}

export async function retrieveWebblenStripeAccountStatus(data: any, context: any){
     //request data
     const uid = data.uid;
    
     //get platform maintenance status
     const platformData = await platformDocRef.get();
     const underMaintenance = await platformData.data()!.underMaintenance;
     
     //stripe info
     const stripeData = await stripeDocRef.get();
     let stripeSecretKey;
 
     //get testing key if platform is under maintenance
     if (underMaintenance){
         stripeSecretKey = stripeData.data()!.testSecretKey;
     } else {
         stripeSecretKey = stripeData.data()!.secretKey;
     }
    const stripe = require('stripe')(stripeSecretKey);

    //get user stripe uid
    const userStripeAcct = await stripeConnectAccountRef.doc(uid).get();
    const stripeUID = userStripeAcct.data()!.stripeUID;

    //retrieve account requirements
    let requirements;
    const stripeAcct = await stripe.accounts.retrieve(stripeUID);
    const payoutsEnabled = stripeAcct.payoutsEnabled;
    
    if (payoutsEnabled){
        requirements = {};
    } else {
        requirements = stripeAcct.requirements;
    }

    return requirements;
}

export async function createPaymentMethodFromCard(data: any, context: any){
    //request data
    let status = "passed";
    const uid = data.uid;
    const cardNum = data.cardNum;
    const expMonth = data.expMonth;
    const expYear = data.expYear;
    const cvcNum = data.cvcNum;
    const cardHolderName = data.cardHolderName;
    
     //get platform maintenance status
     const platformData = await platformDocRef.get();
     const underMaintenance = await platformData.data()!.underMaintenance;
     
     //stripe info
     const stripeData = await stripeDocRef.get();
     let stripeSecretKey;
 
     //get testing key if platform is under maintenance
     if (underMaintenance){
         stripeSecretKey = stripeData.data()!.testSecretKey;
     } else {
         stripeSecretKey = stripeData.data()!.secretKey;
     }
    const stripe = require('stripe')(stripeSecretKey);

    //get user stripe uid
    const userStripeAcct = await stripeConnectAccountRef.doc(uid).get();
    const stripeUID = userStripeAcct.data()!.stripeUID;

    //create payment method
    const stripeTokenResponse = await stripe.tokens.create(
        {
          card: {
            number: cardNum,
            exp_month: expMonth,
            exp_year: expYear,
            cvc: cvcNum,
            name: cardHolderName,
            currency: 'usd',
          },
        },
      ).catch(function onError(error:any) {
        console.log(error);
        status = error;
      });

    //connect and save payment method
    if (status === "passed"){
        const stripeResponse = await stripe.accounts.createExternalAccount(
            stripeUID,
            {
                external_account: stripeTokenResponse.id,
            },
        ).catch(function onError(error:any) {
            console.log(error);
            status = error;
          });
          console.log(stripeResponse);
          if (status === "passed"){
            await admin.firestore().collection('stripe').doc(uid).update({
                "cardInfo": {
                    "last4": stripeResponse.last4,
                    "brand": stripeResponse.brand,
                    "expYear": stripeResponse.exp_year.toString(),
                    "expMonth": stripeResponse.exp_month.toString(),
                    "funding": stripeResponse.funding,
                },
            });
          }
      }
    
      return status;
}

export async function createPaymentMethodFromBankInfo(data: any, context: any){
    //request data
    let status = "passed";
    const uid = data.uid;
    const accountHolderName = data.accountHolderName;
    const accountHolderType = data.accountHolderType;
    const routingNumber = data.routingNumber;
    const accountNumber = data.accountNumber;
    
    //create bank info
    const bankInfo = {
        "object": "bank_account",
        "country": "US",
        "currency": "usd",
        "account_holder_name": accountHolderName,
        "account_holder_type": accountHolderType,
        "routing_number": routingNumber,
        "account_number": accountNumber,
    };

    //get platform maintenance status
    const platformData = await platformDocRef.get();
    const underMaintenance = await platformData.data()!.underMaintenance;
    
    //stripe info
    const stripeData = await stripeDocRef.get();
    let stripeSecretKey;

    //get testing key if platform is under maintenance
    if (underMaintenance){
        stripeSecretKey = stripeData.data()!.testSecretKey;
    } else {
        stripeSecretKey = stripeData.data()!.secretKey;
    }
    const stripe = require('stripe')(stripeSecretKey);

    //get user stripe uid
    const userStripeAcct = await stripeConnectAccountRef.doc(uid).get();
    const stripeUID = userStripeAcct.data()!.stripeUID;

    //connect and save payment method
    const stripeResponse = await stripe.accounts.createExternalAccount(
        stripeUID,
        {
            external_account: bankInfo,
        },
    ).catch(function onError(error:any) {
        console.log(error);
        status = error;
      });
    console.log(stripeResponse);
    if (status === "passed"){
        await admin.firestore().collection('stripe').doc(uid).update({
            "bankInfo": {
                "accountHolderName": stripeResponse.account_holder_name,
                "accountHolderType": stripeResponse.account_holder_type,
                "bankName": stripeResponse.bank_name,
                "last4": stripeResponse.last4,
            },
        });
    }
    return status;
}