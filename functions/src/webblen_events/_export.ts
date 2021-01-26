//Firebase Imports
import * as functions from "firebase-functions";

//Custom Imports
import * as checkInCheckOutFunctions from "./check_in_check_out";


//EVENT CHECK IN/OUT
export const checkIntoEvent = functions.https.onCall((data, context) => {
    return checkInCheckOutFunctions.checkIntoEvent(data, context);
});

export const checkOutOfEvent = functions.https.onCall((data, context) => {
    return checkInCheckOutFunctions.checkOutOfEvent(data, context);
});