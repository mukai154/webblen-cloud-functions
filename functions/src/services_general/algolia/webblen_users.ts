import * as algoliaInit from "./algolia_init";

export async function saveWebblenUserToSearchIndex(data: any) {
	const objectData = data;
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_users");
	await index
		.saveObject({ ...objectData, objectID })
		.catch((error: any) => {
			console.log(error);
		});
}

export async function deleteWebblenUserFromSearchIndex(data: any) {
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_users");
	await index.deleteObject(objectID).catch((error: any) => {
		console.log(error);
	});
}
