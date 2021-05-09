// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports
import * as algoliaService from "../services_general/algolia/webblen_events";
import * as webblenEventService from "../services_general/firestore/webblen_event_service";
import * as webblenUserService from "../services_general/firestore/webblen_user_service";

export const createWebblenEventTrigger = functions.firestore
	.document("webblen_events/{doc}")
	.onCreate(async (event) => {
		const data = event.data();
		const authorUsername = await webblenUserService.getUsername(data.authorID);
		const followersToNotify = await webblenUserService.getFollowersToNotify(data.authorID);
		await webblenEventService.createNotificationForWebblenEvent(data, authorUsername, followersToNotify);
		return algoliaService.saveWebblenEventToSearchIndex(data);
	});

export const updateWebblenEventTrigger = functions.firestore
	.document("webblen_events/{doc}")
	.onUpdate(async (event) => {
		const data = event.after.data();
		return algoliaService.saveWebblenEventToSearchIndex(data);
	});

export const deleteWebblenEventTrigger = functions.firestore
	.document("webblen_events/{doc}")
	.onDelete(async (event) => {
		const data = event.data();
		return algoliaService.deleteWebblenEventFromSearchIndex(data);
	});
