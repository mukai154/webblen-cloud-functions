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
                        interval: "manual",
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
    let error;
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
    const stripeAcct = await stripe.accounts.retrieve(stripeUID).catch(function onError(e:any) {
      console.log(e);
      error = e.raw.message;
    });

    if (error != null){
      return error;
    }

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
            await stripeConnectAccountRef.doc(uid).update({
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
        await stripeConnectAccountRef.doc(uid).update({
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

export async function updateStripeAccountBalance(data: any, context: any){
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
    


    const stripeResponse = await stripe.balance.retrieve({
        stripeAccount: stripeUID,
      }
    ).catch(function onError(error:any) {
        console.log(error);
      });
    
    console.log(stripeResponse);
      
    const availableBalanceInCents = stripeResponse.available[0].amount;
    const pendingBalanceInCents = stripeResponse.pending[0].amount;

    console.log(availableBalanceInCents);
    console.log(pendingBalanceInCents);
    
    await stripeConnectAccountRef.doc(uid).update({
        "availableBalance": availableBalanceInCents/100,
        "pendingBalance": pendingBalanceInCents/100,
    });

    return "passed";
}

export async function processTicketPurchase(data: any, context: any){
    //request data
    let status = "passed";
    const eventTitle = data.eventTitle;
    const purchaserID = data.purchaserID;
    const eventHostID = data.eventHostID;
    const totalCharge = data.totalCharge;
    const ticketCharge = data.ticketCharge;
    const numberOfTickets = data.numberOfTickets;
    const cardNumber = data.cardNumber;
    const expMonth = data.expMonth;
    const expYear = data.expYear;
    const cvcNumber = data.cvcNumber;
    const cardHolderName = data.cardHolderName;
    const email = data.email;
    
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
    const userStripeAcct = await stripeConnectAccountRef.doc(eventHostID).get();
    const stripeUID = userStripeAcct.data()!.stripeUID;

    
    //1. CREATE PAYMENT METHOD
    const stripePaymentMethodResponse = await stripe.paymentMethods.create(
        {
          type: 'card',
          card: {
            number: cardNumber,
            exp_month: expMonth,
            exp_year: expYear,
            cvc: cvcNumber,
          },
          billing_details: {
            name: cardHolderName,
          },
        },
      ).catch(function onError(error:any) {
        console.log(error);
        status = "Payment Method Error";
      });
  
    if (status === 'passed'){
        console.log('charging card...');
        
      //2. CHARGE CARD AND TRANSFER FUNDS TO CONNECT ACCT
      const stripeReponse = await stripe.paymentIntents.create(
        {
          payment_method: stripePaymentMethodResponse.id,
          amount: totalCharge,
          currency: 'usd',
          description: 'Purchase for ' + numberOfTickets.toString() + " for the event: " + eventTitle.toUpperCase(),
          statement_descriptor: 'WEBBLEN INC',
          statement_descriptor_suffix: 'TCKT PRCHASE',
          receipt_email: email,
          transfer_data: {
            amount: ticketCharge,
            destination: stripeUID,
          },
        },
      ).catch(function onError(error:any) {
        console.log(error);
        status = "Transaction Error";
      });

      if (status === "passed"){
        console.log('confirming and transfering funds...');
        //3. CONFIRM CHARGE & TRANSFER
        const stripePaymentResponse = await stripe.paymentIntents.confirm(
          stripeReponse.id
        ).catch(function onError(error:any) {
          console.log(error);
          status = "error";
        });
        console.log(stripePaymentResponse);
        if (status === "passed"){
          
          console.log('creating reciept...');
          //4. CREATE RECORD OF TICKET(S) PURCHASE
          const purchaseID = Date.now().toString() + "-" + eventHostID;
          await admin.firestore().collection("stripe_connect_activity").doc(purchaseID).set({
              "uid": eventHostID,
              "description": cardHolderName.toUpperCase() + " purchased " + numberOfTickets.toString() + " ticket(s) for your event: " + eventTitle.toUpperCase(),
              "timePosted": Date.now(),
              "purchaserID": purchaserID,
              "value": "$" + (ticketCharge/100).toFixed(2),
          });
        }
      }
    }

    return status;
  }

  export async function processInstantPayout(data: any, context: any){
    let status = "passed";

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

    const stripeBalanceResponse = await stripe.balance.retrieve({
        stripeAccount: stripeUID,
      }
    );

    //get user stripe balance
    const originalBalanceInCents = stripeBalanceResponse.available[0].amount;
    const instantPayoutFee = 100;
    

    //CHARGE FEE
    const stripeChargeResponse  = await stripe.charges.create({
        amount: instantPayoutFee,
        currency: "usd",
        source: stripeUID,
    }).catch(function onError(error:any) {
        console.log(error);
        status = error;
    });

    console.log(stripeChargeResponse);

    //Perform Payout
      if (status === "passed"){
        const stripeAccountCardsResponse = await stripe.accounts.listExternalAccounts(
            stripeUID,
            {object: 'card', limit: 1},
            ).catch(function onError(error:any) {
                console.log(error);
                status = error;
            });
            console.log(stripeAccountCardsResponse);
            
            if (status === "passed"){
                const timestamp1 = Date.now().toString() + "-" + uid;
                const stripePayoutResponse = await stripe.payouts.create(
                    {
                        amount: originalBalanceInCents - instantPayoutFee, 
                        currency: 'usd',
                        method: 'instant',
                        destination: stripeAccountCardsResponse.data[0].id,
                        statement_descriptor: "WEBBLEN EARNINGS PAY",
                    },
                    {
                    stripeAccount: stripeUID,
                  }
                ).catch(function onError(error:any) {
                    console.log(error);
                    status = error;
                  });
                  const payoutFeeInDollars = "$" + (((originalBalanceInCents - stripePayoutResponse.amount)/100)).toFixed(2).toString();
                  const balanceInDollarsAfterFees = "$" + ((stripePayoutResponse.amount/100)).toFixed(2).toString();
                  
                  await admin.firestore().collection("stripe_connect_activity").doc(timestamp1).set({
                    "uid": uid,
                    "description": "Instant Payout Fee",
                    "timePosted": Date.now(),
                    "value": payoutFeeInDollars,
                }); 
                console.log(stripePayoutResponse);
                const timestamp2 = Date.now().toString() + "-" + uid;
                    await admin.firestore().collection('stripe').doc(uid).update({
                        "availableBalance": 0,
                    });
                    await admin.firestore().collection("stripe_connect_activity").doc(timestamp2).set({
                      "uid": uid,
                      "description": "Instant Payout",
                      "timePosted": Date.now(),
                      "value": balanceInDollarsAfterFees,
                    }); 
            }
      }
    return status;
}

export async function processStandardPayout(data: any){
  let status = "passed";
  //request data
  const uid = data.uid;
  const stripeUID = data.stripeUID;

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


  const stripeBalanceResponse = await stripe.balance.retrieve({
      stripeAccount: stripeUID,
    }
  );

  //get user stripe balance
  const originalBalanceInCents = stripeBalanceResponse.available[0].amount;
  

  //Perform Payout
  const stripeAccountResponse = await stripe.accounts.listExternalAccounts(
    stripeUID,
    {object: 'bank_account', limit: 1},
    ).catch(function onError(error:any) {
        console.log(error);
        status = error;
    });
    console.log(stripeAccountResponse);
    
    if (status === "passed"){
        const timestamp = Date.now().toString() + "-" + uid;
        await stripe.payouts.create(
            {
                amount: originalBalanceInCents, 
                currency: 'usd',
                method: 'standard',
                destination: stripeAccountResponse.data[0].id,
                statement_descriptor: "WEBBLEN EARNINGS PAY",
            },
            {
            stripeAccount: stripeUID,
          }
        ).catch(function onError(error:any) {
            console.log(error);
            status = error;
          });
        if (status === "passed"){
          const payoutInDollars = "$" + ((originalBalanceInCents/100)).toFixed(2).toString();
          await admin.firestore().collection('stripe').doc(uid).update({
            "availableBalance": 0.001,
          });
          await admin.firestore().collection("stripe_connect_activity").doc(timestamp).set({
            "uid": uid,
            "description": "Weekly Standard Payout",
            "timePosted": Date.now(),
            "value": payoutInDollars,
          });
        }
    }
}