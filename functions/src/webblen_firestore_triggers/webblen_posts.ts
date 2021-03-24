// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports
import * as algoliaService from "../services/algolia/webblen_posts";
import * as webblenPostService from "../services/firestore/webblen_post_service";
import * as webblenUserService from "../services/firestore/webblen_user_service";

export const createWebblenPostsTrigger = functions.firestore
	.document("posts/{doc}")
	.onCreate(async (event) => {
		const data = event.data();
		const authorUsername = await webblenUserService.getUsername(data.authorID);
		await webblenPostService.createNotificationForWebblenPost(data, authorUsername);
		return algoliaService.saveWebblenPostToSearchIndex(data);
	});

export const updateWebblenPostsTrigger = functions.firestore
	.document("posts/{doc}")
	.onUpdate(async (event) => {
		const data = event.after.data();
		return algoliaService.saveWebblenPostToSearchIndex(data);
	});

export const deleteWebblenPostsTrigger = functions.firestore
	.document("posts/{doc}")
	.onDelete(async (event) => {
		const data = event.data();
		return algoliaService.deleteWebblenPostFromSearchIndex(data);
	});
