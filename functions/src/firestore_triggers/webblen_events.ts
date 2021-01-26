// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports


export const createWebblenEventTigger = functions.firestore
	.document("webblen_events/{event}")
	.onCreate(async (event) => {
		const data = event.data();
        //return algoliaWebblenEventFunctions.saveEventToSearchIndex(data);
        return;
	});

export const updateWebblenEventTrigger = functions.firestore
	.document("webblen_events/{event}")
	.onUpdate(async (event) => {
        const prevData = event.before.data();
        const updatedData = event.after.data();
        
        if (prevData.attendees !== updatedData.attendees){
            //Update Payout
        }
        //return algoliaWebblenEventFunctions.saveEventToSearchIndex(data);
        return ;
	});

export const deleteWebblenTrigger = functions.firestore
	.document("webblen_events/{event}")
	.onDelete(async (event) => {
		const data = event.data();
        //return algoliaWebblenEventFunctions.deleteEventFromSearchIndex(data);
        return;
	});
