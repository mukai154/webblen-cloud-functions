// Library Imports
import * as functions from 'firebase-functions'

// Custom Imports
import * as locationService from "../../services_general/location/location_service";

export const findNearestZipcodes = functions.https.onCall((data, context) => {
    return locationService.findNearestZipcodes(data, context);
});

export const reverseGeocodeLatLon = functions.https.onCall((data, context) => {
    return locationService.reverseGeocodeLatLon(data, context);
});
