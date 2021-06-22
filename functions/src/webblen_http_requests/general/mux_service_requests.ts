// Library Imports
import * as functions from 'firebase-functions'

// Custom Imports
import * as muxService from "../../services_general/mux/mux_service";

//streams
export const createMuxStream = functions.https.onCall((data, context) => {
    return muxService.createMuxStream(data);
});

export const retrieveMuxStream = functions.https.onCall((data, context) => {
    return muxService.retrieveMuxStream(data);
});

export const disableMuxStream = functions.https.onCall((data, context) => {
    return muxService.disableMuxStream(data);
});

export const enableMuxStream = functions.https.onCall((data, context) => {
    return muxService.enableMuxStream(data);
});

export const completeMuxStream = functions.https.onCall((data, context) => {
    return muxService.completeMuxStream(data);
});

export const deleteMuxStream = functions.https.onCall((data, context) => {
    return muxService.deleteMuxStream(data);
});

//assets
export const retrieveMuxAsset = functions.https.onCall((data, context) => {
    return muxService.retrieveMuxAsset(data);
});

export const deleteMuxAsset = functions.https.onCall((data, context) => {
    return muxService.deleteMuxAsset(data);
});