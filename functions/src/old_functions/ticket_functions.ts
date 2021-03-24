import * as admin from 'firebase-admin'

const purchasedTicketsRef = admin.firestore().collection('purchased_tickets');
const ticketDistroRef = admin.firestore().collection('ticket_distros');

export async function getPurchasedTickets(data: any, context: any){
    const tickets = [];
    const uid = data.uid;
    const ticketsQuery = await purchasedTicketsRef.where("purchaserUID", "==", uid).get();
    for (const ticketDoc of ticketsQuery.docs){
        tickets.push(ticketDoc.data());
    }
    return tickets;
}

export async function getTicketDistro(data: any, context: any){
    const eventID = data.eventID;
    const ticketDoc = await ticketDistroRef.doc(eventID).get();
    const ticketDistro = ticketDoc.data()!;
    return ticketDistro;
}

export async function checkIfTicketIsValid(data: any, context: any){
    let status = "invalid";
    const eventID = data.eventID;
    const ticketID = data.ticketID;
    const ticketDistroQuery = await ticketDistroRef.doc(eventID).get();
    const ticketDistroData = ticketDistroQuery.data()!;
    const validTicketIDs = ticketDistroData.validTicketIDs;
    const usedTicketIDs = ticketDistroData.usedTicketIDs;

    
    if (validTicketIDs.includes(ticketID)){
        const index = validTicketIDs.indexOf(ticketID);
        validTicketIDs.splice(index, 1);
        usedTicketIDs.push(ticketID);
        status = "valid";
        await ticketDistroRef.doc(eventID).update({
            "validTicketIDs": validTicketIDs,
            "usedTicketIDs": usedTicketIDs,
        })
    } else if (usedTicketIDs.includes(ticketID)){
        status = "used";;
    } 
    return status;
}