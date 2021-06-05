import * as algoliaInit from "./algolia_init";

export async function saveWebblenPostToSearchIndex(data: any) {
	const objectData = data;
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_posts");
	await index
		.saveObject({ ...objectData, objectID })
		.catch((error: any) => {
			console.log(error);
		});
}

export async function deleteWebblenPostFromSearchIndex(data: any) {
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_posts");
	await index.deleteObject(objectID).catch((error: any) => {
		console.log(error);
	});
}
