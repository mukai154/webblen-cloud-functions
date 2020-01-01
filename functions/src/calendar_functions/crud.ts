import * as admin from 'firebase-admin'

const database = admin.firestore();
const calendarRef = database.collection('user_calendars');

//**
//**
//** 
//CREATE

//**
//**
//** 
//READ
export async function getUserCalendarEvents(data: any, context: any){
    const events = [];
    const uid = data.uid;
    const calendarSnapshot = await calendarRef.doc(uid).collection('events').get();
    for (const eventDoc of calendarSnapshot.docs){
        const event = eventDoc.data();
        events.push(event);
    }
    return events
}

//**
//**
//** 
//UPDATE

//**
//**
//** 
//DELETE
