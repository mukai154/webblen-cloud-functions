// Library Imports
import * as functions from 'firebase-functions'
import * as corsModule from 'cors';

// Custom Imports
import * as googlePlacesWebService from "../../services_web/google_places/google_places_web_service";

const cors = corsModule({origin: true});

export const googleSearchAutocompleteWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return googlePlacesWebService.googleSearchAutocompleteWeb(req, res);
    });
});

export const getLatLonFromGooglePlaceIDWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return googlePlacesWebService.getLatLonFromGooglePlaceIDWeb(req, res);
    });
});

export const getLocationDetailsFromLatLonWeb = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return googlePlacesWebService.getLocationDetailsFromLatLonWeb(req, res);
    });
});