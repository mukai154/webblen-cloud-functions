import * as admin from 'firebase-admin'
import * as geo from 'geofirestore'
const database = admin.firestore();
const comRef = database.collection('locations');
const geofirestore = new geo.GeoFirestore(database);
const comGeoRef = geofirestore.collection('locations');
const userRef = database.collection('webblen_user');
// const pastEventsRef = database.collection('past_events');


//**
//**
//** 
//CREATE

//**
//**
//** 
//READ
export async function checkIfCommunityExists(data: any, context: any){
    let exists = false;
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    if (comDoc.exists){
        exists = true;
    }
    return exists;
}

export async function getCommunityByName(data: any, context: any){
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    const comData = comDoc.data()!;
    return comData;
}

export async function getUserCommunities(data: any, context: any){
    const userComs = [];
    const locations = [];
    const locQuery = await comRef.get();
    for (const locDoc of locQuery.docs){
        locations.push(locDoc.id);
    }
    for (const loc of locations){
        const comQuery = await comRef.doc(loc).collection('communities').where('memberIDs', 'array-contains', data.uid).get();
        for (const comDoc of comQuery.docs){
            userComs.push(comDoc.data());
        }
    }
    return userComs;
}

export async function getNearbyCommunities(data: any, context: any){
    const communities = [];
    const geoPoint = new admin.firestore.GeoPoint(data.lat, data.lon);
    const query = await comGeoRef.near({center: geoPoint, radius: 15}).get();
    for (const doc of query.docs){
        const comQuery = await database.collection('locations').doc(doc.id).collection('communities').get();
        for (const comDoc of comQuery.docs){
            const comData = comDoc.data();
            if (comData.communityType === 'public'){
                communities.push(comData);
            }
        }
    }
    return communities;
}

export async function getCommunityMembersFollowers(data: any, context: any){
    const usersData = [];
    const userIDs = data.userIDs;
    for (const uid of userIDs){
        const userDoc = await userRef.doc(uid).get();
        if (userDoc.exists){
            usersData.push(userDoc.data()!.d)
        }
    }
    return usersData;
}



//**
//**
//** 
//UPDATE
export async function inviteUsersToCommunity(data: any, context: any){
    const invitedUsers = data.invitedUsers;
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    const comData = comDoc.data()!;
    const prevInvitedUsers = comData.invited;
    const newInvitedUsers = invitedUsers.concat(prevInvitedUsers);
    await comRef.doc(data.areaName).collection('communities').doc(data.comName).update({
        'invited': newInvitedUsers
    });
}

export async function removeInvitedUserFromCommunity(data: any, context: any){
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    if (comDoc.exists){
        const comData = comDoc.data()!;
        const invitedUsers = comData.invited;
        if (invitedUsers.includes(data.uid)){
            const index = invitedUsers.indexOf(data.uid);
            invitedUsers.splice(index, 1);
        }
        await comRef.doc(data.areaName).collection('communities').doc(data.comName).update({
            'invited': invitedUsers
        });
    }
}

export async function updateCommunityFollowers(data: any, context: any){
    //Update Com Data
    const comName = data.comName;
    const areaName = data.areaName;
    const comDoc = await comRef.doc(areaName).collection('communities').doc(comName).get();
    const comData = comDoc.data()!;
    let activityCount = comData.activityCount
    const followers = comData.followers;
    if (followers.includes(data.uid)){
        const followerIndex = followers.indexOf(data.uid);
        followers.splice(followerIndex, 1);
        activityCount = activityCount - 1;
    } else {
        followers.push(data.uid);
        activityCount = activityCount + 1;
    }
    await comRef.doc(areaName).collection('communities').doc(comName).update({
        'followers': followers,
        'activityCount': activityCount
    });

    //Update User Data
    const userDoc = await userRef.doc(data.uid).get();
    const userData = userDoc.data()!.d;
    const followingCommunities = userData.followingCommunities;    
    const followingAreas = Object.keys(followingCommunities);
    console.log(followingAreas);
    if (followingAreas.includes(areaName)){
        const communitiesFollowingInArea = followingCommunities[areaName];
        if (communitiesFollowingInArea.includes(data.comName)){
            const comIndex = communitiesFollowingInArea.indexOf(data.comName);
            communitiesFollowingInArea.splice(comIndex, 1);
        } else {
            communitiesFollowingInArea.push(data.comName);
        }
        followingCommunities[areaName] = communitiesFollowingInArea;
    } else {
        followingCommunities[areaName] = [comName];
    }
    await userRef.doc(data.uid).update({
        'd.followingCommunities': followingCommunities
    });
    return true;
}
export async function leaveCommunity(data: any, context: any){
    //Update Com Data
    const comDoc = await comRef.doc(data.areaName).collection('communities').doc(data.comName).get();
    const comData = comDoc.data()!;
    const memberIDs = comData.memberIDs;
    if (memberIDs.includes(data.uid)){
        const memberIDIndex = memberIDs.indexOf(data.uid);
        memberIDs.splice(memberIDIndex, 1);
    }
    await comRef.doc(data.areaName).collection('communities').doc(data.comName).update({
        'memberIDs': memberIDs,
    });
    //Update User Data
    const userDoc = await userRef.doc(data.uid).get();
    const userData = userDoc.data()!.d;
    const userComs = userData.communities;
    const communitiesInArea = userComs[data.areaName];
    if (communitiesInArea.includes(data.comName)){
        const comIndex = communitiesInArea.indexOf(data.comName);
        communitiesInArea.splice(comIndex, 1);
    }
    userComs[data.areaName] = communitiesInArea;
    await userRef.doc(data.uid).update({
        'd.communities': userComs
    });
    return true;
}
export async function joinCommunity(data: any, context: any){
    //Update Com Data
    const areaName = data.areaName;
    const comName = data.comName;
    const comDoc = await comRef.doc(areaName).collection('communities').doc(comName).get();
    const comData = comDoc.data()!;
    const memberIDs = comData.memberIDs;
    let comStatus = comData.status;
    let activityCount = comData.activityCount
    memberIDs.push(data.uid);
    activityCount = activityCount + 1;
    if (memberIDs.keys.length >= 3){
            comStatus = 'active';
    }
    await comRef.doc(areaName).collection('communities').doc(comName).update({
        'memberIDs': memberIDs,
        'activityCount': activityCount,
        'status': comStatus,
    });
    //Update User Data
    const userDoc = await userRef.doc(data.uid).get();
    const userData = userDoc.data()!.d;
    const userComs = userData.communities;
    const memberAreas = Object.keys(userComs);
    if (memberAreas.includes(areaName)){
        const memberComsInArea = userComs[areaName];
        if (!memberComsInArea.includes(comName)){
            memberComsInArea.push(comName);
        } 
        userComs[areaName] = memberComsInArea;
    } else {
        userComs[areaName] = [comName];
    }
    await userRef.doc(data.uid).update({
        'd.communities': userComs
    });
    return true;
}

export async function updateCommunityMembers(data: any, context: any){
    //Update Com Data
    const areaName = data.areaName;
    const comName = data.comName;
    const comDoc = await comRef.doc(areaName).collection('communities').doc(comName).get();
    const comData = comDoc.data()!;
    const memberIDs = comData.IDs;
    let comStatus = comData.status;
    let activityCount = comData.activityCount
    memberIDs.push(data.uid);
    activityCount = activityCount + 1;
    if (memberIDs.keys.length >= 3){
            comStatus = 'active';
    }
    
    await comRef.doc(areaName).collection('communities').doc(comName).update({
        'memberIDs': memberIDs,
        'activityCount': activityCount,
        'status': comStatus,
    });

    //Update User Data
    const userDoc = await userRef.doc(data.uid).get();
    const userData = userDoc.data()!.d;
    const userComs = userData.communities;
    const memberAreas = Object.keys(userComs);
    if (memberAreas.includes(areaName)){
        const memberComsInArea = userComs[areaName];
        if (!memberComsInArea.includes(comName)){
            memberComsInArea.push(comName);
        } 
        userComs[areaName] = memberComsInArea;
    } else {
        userComs[areaName] = [comName];
    }
    await userRef.doc(data.uid).update({
        'd.communities': userComs
    });
    return true;
}







//**
//**
//** 
//DELETE