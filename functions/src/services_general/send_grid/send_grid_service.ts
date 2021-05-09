import * as admin from 'firebase-admin'



export async function sendTicketPurchaseConfirmationEmail(req: any, res: any) {
  ///Request Data
  console.log('sending confirmation email..');
  const data = req.body.data;
  const emailAddress = data.emailAddress;
  console.log('sending email to:');
  console.log(emailAddress);
  const eventTitle = data.eventTitle;
  const purchasedTickets = data.purchasedTickets;
  const additionalTaxesAndFees = data.additionalTaxesAndFees;
  const discountCodeDescription = data.discountCodeDescription;
  const discountValue = data.discountValue;
  const totalCharge = data.totalCharge;

  //SendGrid Auth
  const appInfoDoc = await admin.firestore().collection("app_release_info").doc('sendgrid').get();
  const sendgridData = appInfoDoc.data()!;
  const sendgridApiKey = sendgridData.apiKey;
  const ticketEmailTemplateID = sendgridData.ticketEmailTemplateID;
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridApiKey);

  //SendGrid Email
  const msg = {
      to: emailAddress,
      from: 'team@webblen.com',
      templateId: ticketEmailTemplateID,
      dynamic_template_data: {
        event_title: eventTitle,
        tickets: purchasedTickets,
        total_charge: totalCharge,
        additional_taxes_and_fees: additionalTaxesAndFees, 
        discount_code_description: discountCodeDescription,
        discount_value: discountValue
      }
    };
  
    return sgMail.send(msg);
}

///SENDGRID TEST DATA
// {
//   "event_title": "test event title",
//   "tickets": [
//       {
//       "ticketName": "General Admission", 
//       "ticketPrice": "$9.99", 
//       "ticketID": "x1112",
//       "ticketURL": "https://app.webblen.io/tickets/view/x1112",
//       },
//       {
//       "ticketName": "VIP Admission", 
//       "ticketPrice": "$10.00", 
//       "ticketID": "x1112",
//       "ticketURL": "https://app.webblen.io/tickets/view/x1112",
//       },
//   ],
//   "total_charge": "$19.99"
//   }