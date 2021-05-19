// Firebase Imports
import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";

const database = admin.firestore();
const eventsRef = database.collection('webblen_events');

// Custom Imports
import * as algoliaService from "../services_general/algolia/webblen_events";
import { createWebblenEventFromScrapedData } from "../services_general/firestore/webblen_event_service";

export const createScrapedEventTrigger = functions.firestore
	.document("scraped_events/{doc}")
	.onCreate(async (scrapedEvent) => {
		const data = scrapedEvent.data();
		const webblenEvent = await createWebblenEventFromScrapedData(data);
        await eventsRef.doc(data.id).create(webblenEvent);
		return algoliaService.saveWebblenEventToSearchIndex(webblenEvent);
	});
