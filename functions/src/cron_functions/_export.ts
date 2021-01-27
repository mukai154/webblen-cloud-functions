//Firebase Imports
import * as functions from "firebase-functions";

//Custom Imports
import * as webblenPayoutFunctions from "./webblen_payouts";


export const distributeEventPay = functions
.pubsub 
.schedule('every 2 hours')
.timeZone('America/Chicago')
.onRun(event => {

    return webblenPayoutFunctions.distributeEventPay(event);
});