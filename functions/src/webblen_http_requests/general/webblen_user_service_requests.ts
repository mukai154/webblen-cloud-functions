// Library Imports
import * as functions from 'firebase-functions'

// Custom Imports
import * as webblenUserService from "../../services_general/firestore/webblen_user_service";

export const haveEveryoneFollowWebblen = functions.https.onRequest((data, context) => {
    return webblenUserService.haveEveryoneFollowWebblen();
});