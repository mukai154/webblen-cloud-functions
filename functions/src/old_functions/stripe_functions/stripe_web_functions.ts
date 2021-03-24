import * as admin from "firebase-admin"

export async function testPurchaseTickets(req: any, res: any){
    let status = "passed";
    const data = req.body.data;
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
    
    //Stripe Info
    const appInfoDoc = await admin.firestore().collection("app_release_info").doc('stripe').get();
    const appStripeData = appInfoDoc.data()!;
    const testSecretKey = appStripeData.testSecretKey;
    const stripe = require('stripe')(testSecretKey);
    console.log(testSecretKey);
    
  
    //Stripe Connect Acct Info
    const hostStripeDoc = await admin.firestore().collection("stripe").doc(eventHostID).get();
    const hostStripeData = hostStripeDoc.data()!;
    const hostStripeUID = hostStripeData.stripeUID;
    console.log('creating payment mehtod...');
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
            destination: hostStripeUID,
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
          });
        }
      }
    }
    res.send({"data": {"status": status}});
  }

  export async function livePurchaseTickets(req: any, res: any){
    let status = "passed";
    const data = req.body.data;
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
    
    //Stripe Info
    const appInfoDoc = await admin.firestore().collection("app_release_info").doc('stripe').get();
    const appStripeData = appInfoDoc.data()!;
    const secretKey = appStripeData.secretKey;
    const stripe = require('stripe')(secretKey);
    
  
    //Stripe Connect Acct Info
    const hostStripeDoc = await admin.firestore().collection("stripe").doc(eventHostID).get();
    const hostStripeData = hostStripeDoc.data()!;
    const hostStripeUID = hostStripeData.stripeUID;
    console.log('creating payment mehtod...');
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
            destination: hostStripeUID,
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
          });
        }
      }
    }
    res.send({"data": {"status": status}});
  }

  export async function submitBankingInfoWeb(req: any, res: any){
    let status = "passed";
    console.log(req);
    const data = req.body.data;
    console.log(data);
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

  //Stripe Info
  const appInfoDoc = await admin.firestore().collection("app_release_info").doc('stripe').get();
  const appStripeData = appInfoDoc.data()!;
  const secretKey = appStripeData.secretKey;
  const stripe = require('stripe')(secretKey);

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
    return res.send({"data": {"status": status}});
}

export async function submitCardInfoWeb(req: any, res: any){
    let status = "passed";
    console.log(req);
    const data = req.body.data;
    console.log(data);
    const uid = data.uid;
    const stripeUID = data.stripeUID;
    const cardNumber = data.cardNumber;
    const expMonth = data.expMonth;
    const expYear = data.expYear;
    const cvcNumber = data.cvcNumber;
    const cardHolderName = data.cardHolderName;
    
    //Stripe Info
    const appInfoDoc = await admin.firestore().collection("app_release_info").doc('stripe').get();
    const appStripeData = appInfoDoc.data()!;
    const secretKey = appStripeData.secretKey;
    const stripe = require('stripe')(secretKey);

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
    
      return res.send({"data": {"status": status}});
  }