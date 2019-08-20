import * as admin from 'firebase-admin'
const userRef = admin.firestore().collection('webblen_user');


export async function rechargeUserAP(data: any, context: any){
    const currentDateInMilliseconds = Date.now();
    const dateInMilliseconds3DaysAgo = currentDateInMilliseconds - 259200000;
    const userQuery = await userRef.where('lastAPRechargeInMilliseconds', '<=', dateInMilliseconds3DaysAgo).get();
    for (const userDoc of userQuery.docs){
        const userData = userDoc.data().d;
        let ap = userData.ap;
        const apLvl = userData.apLvl;
        if (apLvl === 1){
            if (ap !== 0.2){
                const apDiff = 0.2 - ap;
                ap = ap + (0.75 * apDiff); 
            }
        } else if (apLvl === 2){
            if (ap !== 0.4){
                const apDiff = 0.4 - ap;
                ap = ap + (0.55 * apDiff); 
            }
        } else if (apLvl === 3){
            if (ap !== 0.6){
                const apDiff = 0.6 - ap;
                ap = ap + (0.35 * apDiff); 
            }
        } else if (apLvl === 4){
            if (ap !== 0.8){
                const apDiff = 0.8 - ap;
                ap = ap + (0.25 * apDiff); 
            }
        } else if (apLvl === 5){
            if (ap !== 1.0){
                const apDiff = 1 - ap;
                ap = ap + (0.15 * apDiff); 
            }
        }
        await userRef.doc(userDoc.id).update({
            'd.ap': ap,
            'lastAPRechargeInMilliseconds': currentDateInMilliseconds
        });
    }
    return true
}