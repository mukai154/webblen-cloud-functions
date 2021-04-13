// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports
import * as algoliaService from "../services_general/algolia/webblen_users";

export const createWebblenUserTrigger = functions.firestore
	.document("webblen_users/{doc}")
	.onCreate(async (event) => {
		const data = event.data();
		return algoliaService.saveWebblenUserToSearchIndex(data);
	});

export const updateWebblenUserTrigger = functions.firestore
	.document("webblen_users/{doc}")
	.onUpdate(async (event) => {
		const data = event.after.data();
		return algoliaService.saveWebblenUserToSearchIndex(data);
	});

export const deleteWebblenUserTrigger = functions.firestore
	.document("webblen_users/{doc}")
	.onDelete(async (event) => {
		const data = event.data();
		return algoliaService.deleteWebblenUserFromSearchIndex(data);
	});
