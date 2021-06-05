// Firebase Imports
import * as functions from "firebase-functions";

// Custom Imports
import * as algoliaService from "../services_general/algolia/webblen_posts";
import * as webblenPostService from "../services_general/firestore/webblen_post_service";
import * as webblenUserService from "../services_general/firestore/webblen_user_service";

export const createWebblenPostTrigger = functions.firestore
	.document("webblen_posts/{doc}")
	.onCreate(async (event) => {
		const data = event.data();
		const authorUsername = await webblenUserService.getUsername(data.authorID);
		const followersToNotify = await webblenUserService.getFollowersToNotify(data.authorID);
		await webblenPostService.createNotificationForWebblenPost(data, authorUsername, followersToNotify);
		return algoliaService.saveWebblenPostToSearchIndex(data);
	});

export const updateWebblenPostTrigger = functions.firestore
	.document("webblen_posts/{doc}")
	.onUpdate(async (event) => {
		const data = event.after.data();
		return algoliaService.saveWebblenPostToSearchIndex(data);
	});

export const deleteWebblenPostTrigger = functions.firestore
	.document("webblen_posts/{doc}")
	.onDelete(async (event) => {
		const data = event.data();
		return algoliaService.deleteWebblenPostFromSearchIndex(data);
	});
