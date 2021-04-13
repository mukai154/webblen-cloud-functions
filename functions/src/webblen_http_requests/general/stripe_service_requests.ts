// Library Imports
import * as functions from 'firebase-functions'

// Custom Imports
import * as stripeService from "../../services_general/stripe/stripe_service";


export const createWebblenStripeConnectAccount = functions.https.onRequest((req, res) => {
    return stripeService.createWebblenStripeConnectAccount(req, res);
});

export const completeCreateWebblenStripeConnectAccount = functions.https.onRequest((req, res) => {
    return stripeService.completeCreateWebblenStripeConnectAccount(req, res);
});

export const retrieveWebblenStripeAccountStatus = functions.https.onCall((data, context) => {
    return stripeService.retrieveWebblenStripeAccountStatus(data, context);
});

export const createPaymentMethodFromCard = functions.https.onCall((data, context) => {
    return stripeService.createPaymentMethodFromCard(data, context);
});

export const createPaymentMethodFromBankInfo = functions.https.onCall((data, context) => {
    return stripeService.createPaymentMethodFromBankInfo(data, context);
});