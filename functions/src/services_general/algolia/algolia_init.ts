import * as admin from "firebase-admin";
import algoliasearch from "algoliasearch";

const appRef = admin.firestore().collection("app_release_info");

export async function getAlgoliaClient() {
	const algoliaDoc = await appRef.doc("algolia").get();
	const algoliaData = algoliaDoc.data()!;
	const apiKey = algoliaData.apiKey;
	const appID = algoliaData.appID;
	const algoliaClient = algoliasearch(appID, apiKey);
	return algoliaClient;
}
