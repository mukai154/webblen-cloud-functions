import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp(functions.config().firebase);

//EXPORTS
export * from './export/cron_functions_export';
export * from './export/firestore_triggers_export';
export * from './export/http_functions_export';
