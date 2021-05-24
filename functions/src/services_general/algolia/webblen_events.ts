import * as algoliaInit from "./algolia_init";

export async function saveWebblenEventToSearchIndex(data: any) {
	const objectData = data;
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_events");
	await index
		.saveObject({ ...objectData, objectID })
		.catch((error: any) => {
			console.log(error);
		});
}

export async function deleteWebblenEventFromSearchIndex(data: any) {
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const index = algoliaClient.initIndex("webblen_events");
	await index.deleteObject(objectID).catch((error: any) => {
		console.log(error);
	});
}
