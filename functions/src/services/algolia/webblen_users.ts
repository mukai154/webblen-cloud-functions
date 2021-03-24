import * as algoliaInit from "./algolia_init";

export async function saveWebblenUserToSearchIndex(data: any) {
	const objectData = data;
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const causesIndex = algoliaClient.initIndex("webblen_users");
	await causesIndex
		.saveObject({ ...objectData, objectID })
		.catch((error: any) => {
			console.log(error);
		});
}

export async function deleteebblenUserFromSearchIndex(data: any) {
	const objectID = data.id;
	const algoliaClient = await algoliaInit.getAlgoliaClient();
	const causesIndex = algoliaClient.initIndex("webblen_users");
	await causesIndex.deleteObject(objectID).catch((error: any) => {
		console.log(error);
	});
}
