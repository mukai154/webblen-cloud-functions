// Library Imports
import * as functions from 'firebase-functions'

// Custom Imports
import * as webblenEventService from "../../services_general/firestore/webblen_event_service";

export const fixWebblenEvents = functions.https.onRequest((data, context) => {
    return webblenEventService.fixWebblenEvents();
});