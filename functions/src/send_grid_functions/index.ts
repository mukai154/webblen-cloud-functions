import * as admin from 'firebase-admin'


export async function sendEmailConfirmation(data: any, res: any){
    console.log('sending confirmation email..');
    //const data = req.body.data;
    console.log(data);
    const emailAddress = data.emailAddress;
    console.log('sending email to:');
    console.log(emailAddress);
    const eventTitle = data.eventTitle;
    console.log(eventTitle);
    const appInfoDoc = await admin.firestore().collection("app_release_info").doc('sendgrid').get();
    const sendgridData = appInfoDoc.data()!;
    const sendgridApiKey = sendgridData.apiKey;
    const ticketEmailTemplateID = sendgridData.ticketEmailTemplateID;
    console.log(sendgridApiKey);
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridApiKey);
    
    const msg = {
        to: emailAddress,
        from: 'team@webblen.com',
        templateId: ticketEmailTemplateID,
        dynamic_template_data: {
            event_title: eventTitle,
        },
      };

    await sgMail.send(msg).catch(function onError(error:any) {
        console.log(error);
      }).catch(function onError(error:any) {
        console.log(error);
      });
    return;
}
