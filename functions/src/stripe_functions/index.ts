import * as admin from "firebase-admin"
const stripe = require('stripe')('sk_live_2g2I4X6pIDNbJGHy5XIXUjKr00IRUj3Ngx');
// export async function retrieveBankInfo(accessToken: any, stripeUID: any){
//     let bankInfo;
//     const stripe = require('stripe')(accessToken);
//     const stripeAccount = await stripe.accounts.retrieve(stripeUID);
//     const externalAccounts = stripeAccount.external_accounts.data;
//     if (externalAccounts[0].object === "bank_account"){
//         bankInfo = externalAccounts[0];
//     }
//     return bankInfo;
// }

// export async function retrieveCardInfo(accessToken: any, stripeUID: any){
//     let cardInfo;
//     const stripe = require('stripe')(accessToken);
//     const stripeAccount = await stripe.accounts.retrieve(stripeUID);
//     const externalAccounts = stripeAccount.external_accounts.data;
//     if (externalAccounts[0].object === "card"){
//         cardInfo = externalAccounts[0];
//     }
//     return cardInfo;
// }

export async function submitBankingInfo(data: any, context: any){
    let status = "passed";
    const uid = data.uid;
    const stripeUID = data.stripeUID;
    const accountHolderName = data.accountHolderName;
    const accountHolderType = data.accountHolderType;
    const routingNumber = data.routingNumber;
    const accountNumber = data.accountNumber;
    const bankInfo = {
        "object": "bank_account",
        "country": "US",
        "currency": "usd",
        "account_holder_name": accountHolderName,
        "account_holder_type": accountHolderType,
        "routing_number": routingNumber,
        "account_number": accountNumber,
    };
    const stripeResponse = await stripe.accounts.createExternalAccount(
        stripeUID,
        {
            external_account: bankInfo,
        },
    ).catch(function onError(error:any) {
        console.log(error);
        status = "error";
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

export async function submitCardInfo(data: any, context: any){
    let status = "passed";
    const uid = data.uid;
    const stripeUID = data.stripeUID;
    const cardNumber = data.cardNumber;
    const expMonth = data.expMonth;
    const expYear = data.expYear;
    const cvcNumber = data.cvcNumber;
    const cardHolderName = data.cardHolderName;

    const stripeTokenResponse = await stripe.tokens.create(
        {
          card: {
            number: cardNumber,
            exp_month: expMonth,
            exp_year: expYear,
            cvc: cvcNumber,
            name: cardHolderName,
            currency: 'usd',
          },
        },
      ).catch(function onError(error:any) {
        console.log(error);
        status = "error";
      });

      if (status === "passed"){
        const stripeResponse = await stripe.accounts.createExternalAccount(
            stripeUID,
            {
                external_account: stripeTokenResponse.id,
            },
        ).catch(function onError(error:any) {
            console.log(error);
            status = "error";
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

export async function checkAccountVerificationStatus(data: any, context: any){
    let requirements;
    const uid = data.uid;
    const userStripeAcct = await admin.firestore().collection("stripe").doc(uid).get();
    const stripeUID = await userStripeAcct.data()!.stripeUID;

    const stripeAcct = await stripe.accounts.retrieve(stripeUID);
    const payoutsEnabled = stripeAcct.payoutsEnabled;
    
    if (payoutsEnabled){
        requirements = {};
    } else {
        requirements = stripeAcct.requirements;
    }
    return requirements;
}

export async function submitTicketPurchaseToStripe(data: any, context: any){
    let status = "passed";
    const chargeAmount = data.chargeAmount;
    const feeCharge = data.feeCharge;
    const numberOfTickets = data.numberOfTickets;
    const eventID = data.eventID;
    const eventHostUID = data.eventHostUID;
    const cardNumber = data.cardNumber;
    const expMonth = data.expMonth;
    const expYear = data.expYear;
    const cvcNumber = data.cvcNumber;
    const cardHolderName = data.cardHolderName;
    const email = data.email;

    //Host Info
    const hostStripeDoc = await admin.firestore().collection("stripe").doc(eventHostUID).get();
    const hostStripeData = hostStripeDoc.data()!;
    const hostStripeUID = hostStripeData.stripeUID;

    //Ticket & Event Info
    const eventDoc = await admin.firestore().collection("upcoming_events").doc(eventID).get();
    const eventData = eventDoc.data()!.d;
    const eventTitle = eventData.title;


    const stripeTokenResponse = await stripe.tokens.create(
        {
          card: {
            number: cardNumber,
            exp_month: expMonth,
            exp_year: expYear,
            cvc: cvcNumber,
            name: cardHolderName,
            currency: 'usd',
          },
        },
      );

    const stripeReponse = await stripe.charges.create(
        {
          amount: chargeAmount,
          application_fee_amount: feeCharge,
          currency: 'usd',
          source: stripeTokenResponse.id,
          description: 'Purchase for ' + numberOfTickets.toString() + " for the event: " + eventTitle.toUpperCase(),
          receipt_email: email,
          statement_descriptor: 'WEBBLEN INC',
          statement_descriptor_suffix: 'TCKT PRCHASE ' + eventTitle,
        },
        {
            stripeAccount: hostStripeUID,
        },
      ).catch(function onError(error:any) {
        console.log(error);
        status = "error";
      });
      console.log(stripeReponse);
    const timestamp1 = Date.now().toString() + "-" + eventHostUID;
    await admin.firestore().collection("stripe_connect_activity").doc(timestamp1).set({
        "uid": eventHostUID,
        "description": cardHolderName + " purchased " + numberOfTickets.toString() + " ticket(s) for your event: " + eventTitle.toUpperCase(),
        "timePosted": Date.now(),
    });
    return status;
}

export async function getStripeAccountBalance(data: any, context: any){
    const uid = data.uid;
    const stripeUID = data.stripeUID;
    
    const stripeResponse = await stripe.balance.retrieve({
        stripeAccount: stripeUID,
      }
    );
    
    console.log(stripeResponse);
      
    const availableBalanceInCents = stripeResponse.available[0].amount;
    const pendingBalanceInCents = stripeResponse.pending[0].amount;

    console.log(availableBalanceInCents);
    console.log(pendingBalanceInCents);
    
    await admin.firestore().collection('stripe').doc(uid).update({
        "availableBalance": availableBalanceInCents/100,
        "pendingBalance": pendingBalanceInCents/100,
    });

    return;
}

export async function performInstantStripePayout(data: any, context: any){
    let status = "passed";
    const uid = data.uid;
    const stripeUID = data.stripeUID;
    
    const stripeBalanceResponse = await stripe.balance.retrieve({
        stripeAccount: stripeUID,
      }
    );
    const originalBalanceInCents = stripeBalanceResponse.available[0].amount;
    const instantPayoutFee = 100;
    
    // const payoutFeeInDollars = "$" + (((instantPayoutFee + stripePayoutFee)/100)).toFixed(2).toString();

    //CHARGE FEE
    const stripeChargeResponse  = await stripe.charges.create({
        amount: instantPayoutFee,
        currency: "usd",
        source: stripeUID,
    }).catch(function onError(error:any) {
        console.log(error);
        status = "error";
    });

    console.log(stripeChargeResponse);

    //Perform Payout
      if (status === "passed"){
        const stripeAccountCardsResponse = await stripe.accounts.listExternalAccounts(
            stripeUID,
            {object: 'card', limit: 1},
            ).catch(function onError(error:any) {
                console.log(error);
                status = "error";
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
                    status = "error";
                  });
                  const payoutFeeInDollars = "$" + (((originalBalanceInCents - stripePayoutResponse.amount)/100)).toFixed(2).toString();
                  const balanceInDollarsAfterFees = "$" + ((stripePayoutResponse.amount/100)).toFixed(2).toString();
                  await admin.firestore().collection("stripe_connect_activity").doc(timestamp1).set({
                    "uid": uid,
                    "description": "Instant Payout Fee: -" + payoutFeeInDollars,
                    "timePosted": Date.now(),
                }); 
                console.log(stripePayoutResponse);
                if (status === 'passed'){
                    const timestamp2 = Date.now().toString() + "-" + uid;
                    await admin.firestore().collection('stripe').doc(uid).update({
                        "availableBalance": 0,
                    });
                    await admin.firestore().collection("stripe_connect_activity").doc(timestamp2).set({
                        "uid": uid,
                        "description": "Instant Payout Initiated for " + balanceInDollarsAfterFees,
                        "timePosted": Date.now(),
                    });
                }
            }
      }
    return status;
}




