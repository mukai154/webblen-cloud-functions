import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

///Firebase Initialization
admin.initializeApp(functions.config().firebase);

//Exports
export * from "./webblen_firestore_triggers/_export";
export * from "./webblen_http_requests/general/_export";
export * from "./webblen_http_requests/web_app/_export";
