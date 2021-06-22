// Library Imports
import * as functions from 'firebase-functions'
import * as corsModule from 'cors';

// Custom Imports
import * as muxService from "../../services_general/mux/mux_service";

const cors = corsModule({origin: true});

export const initializeMuxStreamWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return muxService.initializeMuxStreamWeb(req, res);
    });
});

export const createSimulcastStreamWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return muxService.createSimulcastStreamWeb(req, res);
    });
});