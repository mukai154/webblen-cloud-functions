// Library Imports
import * as functions from 'firebase-functions'


// Custom Imports
import * as agoraService from "../../services_general/agora/agora_service";

export const generateAgoraToken = functions.https.onCall((data, context) => {
    return agoraService.generateAgoraToken(data);
});