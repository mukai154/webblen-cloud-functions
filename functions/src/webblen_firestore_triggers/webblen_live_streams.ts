// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports
import * as algoliaService from "../services/algolia/webblen_live_streams";
import * as webblenLiveStreamService from "../services/firestore/webblen_live_stream_service";
import * as webblenUserService from "../services/firestore/webblen_user_service";

export const createWebblenLiveStreamTrigger = functions.firestore
	.document("webblen_live_streams/{doc}")
	.onCreate(async (event) => {
		const data = event.data();
		const authorUsername = await webblenUserService.getUsername(data.authorID);
		await webblenLiveStreamService.createNotificationForWebblenLiveStream(data, authorUsername);
		return algoliaService.saveWebblenLiveStreamToSearchIndex(data);
	});

export const updateWebblenLiveStreamTrigger = functions.firestore
	.document("webblen_live_streams/{doc}")
	.onUpdate(async (event) => {
		const data = event.after.data();
		return algoliaService.saveWebblenLiveStreamToSearchIndex(data);
	});

export const deleteWebblenLiveStreamTrigger = functions.firestore
	.document("webblen_live_streams/{doc}")
	.onDelete(async (event) => {
		const data = event.data();
		return algoliaService.deleteWebblenLiveStreamFromSearchIndex(data);
	});
