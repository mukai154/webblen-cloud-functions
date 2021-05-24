// Library Imports
import * as functions from 'firebase-functions'
import * as corsModule from 'cors';

// Custom Imports
import * as sendgridService from "../../services_general/send_grid/send_grid_service";

const cors = corsModule({origin: true});

export const sendTicketPurchaseConfirmationEmail = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        return sendgridService.sendTicketPurchaseConfirmationEmail(req, res);
    });
});