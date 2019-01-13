let db, authUser;
let user, rooms, friends, room;

/**
 * Initialize firebase and firestore
 *
 * @param config Firebase credentials
 */
function initFirebase(config) {
    // Initialize Firebase
    firebase.initializeApp(config);

    // Initialize Firestore
    db = firebase.firestore();
    db.settings({
        timestampsInSnapshots: true
    });

    user = db.collection("user");
}

/**
 * Query reference from firestore and fetch data contained
 *
 * @param ref Firestore reference object
 * @returns Promise<any> (obj/boolean) Document data or false if DNE/error
 */
function getDataFromRef(ref) {
    return new Promise(resolve => {
        ref.get()
            .then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    console.log("Document does not exist");
                    resolve(false);
                }
            })
            .catch(err => {
                console.log("Error: " + err);
                resolve(false);
            })
    })
}

/**
 * Push new data to ref endpoint
 *
 * @param ref Firestore reference object
 * @param data New data object to push
 * @returns Promise<boolean> Was data set successfully?
 */
function setRefData(ref, data) {
    return new Promise(resolve => {
        ref.set(data)
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

/**
 * Update document data with changes
 *
 * @param ref Firestore reference object
 * @param changes Object containing data to change
 * @returns Promise<boolean> Was data updated successfully?
 */
function updateRefData(ref, changes) {
    return new Promise(resolve => {
        ref.update(changes)
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

/**
 * Add document to a collection
 *
 * @param collection Collection to add document to
 * @param data Document data
 * @returns Promise<any> Added document or false if added unsuccessfully
 */
function addDocument(collection, data) {
    return new Promise(resolve => {
        collection.add(data)
            .then(doc => resolve(doc))
            .catch(() => resolve(false))
    })
}

/**
 * Remove a document at reference endpoint
 *
 * @param docRef Firestore reference to delete
 * @returns Promise<any> Added document or false if added unsuccessfully
 */
function removeDocument(docRef) {
    return new Promise(resolve => {
        docRef.delete()
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

/**
 * Listen for and initialize authenticated user
 *
 * @returns Promise<boolean> Is user signed in?
 */
function initUser() {
    return new Promise(resolve => {
        firebase.auth().onAuthStateChanged(async aUser => {
            if (aUser) {
                authUser = aUser;
                let dbUser = await getDataFromRef(user.doc(authUser.uid));
                if (aUser.displayName !== dbUser.name || aUser.photoURL !== dbUser.profilepic) {
                    let set = await setRefData(user.doc(authUser.uid), {
                        name: aUser.displayName,
                        profilepic: aUser.photoURL
                    });
                    if (!set) {
                        // Not set properly
                    }
                }
                resolve(true);
            } else {
                console.log("User is not signed in");
                resolve(false);
            }
        })
    })
}

/**
 * Get a user's data
 *
 * @param id User's firebase authentication uid
 * @returns Promise<any> User object containing name and profile pic
 */
async function getUser(id) {
    return await getDataFromRef(user.doc(id));
}

/**
 * Listen for changes to a document
 *
 * @param ref Firebase reference to listen for changes to
 * @param callback Function to be called upon change, accepts updated doc data
 */
function listenForChange(ref, callback) {
    ref.onSnapshot(doc => {
        callback(doc.data())
    });
}

/**
 * Initialize variables and listeners interacting with luau
 */
async function initLuau(updateView) {
    rooms = db.collection("rooms");
    friends = db.collection("friends");
    room = db.collection("room");
    listenForChange(rooms.doc(authUser.uid), async doc => {
        // Update React view
        updateView("rooms", await getAllRooms(doc.rooms));
    });
    listenForChange(friends.doc(authUser.uid), async doc => {
        // Update React views
        updateView("friends", await getAllFriends(doc.friends));
    });
}

async function addFriend(friendID) {
    // Add friend to authUser's friends list
    let addedFriend = await updateRefData(friends.doc(authUser.uid), {
        rooms: firebase.firestore.FieldValue.arrayUnion(friendID)
    });
    if (!addedFriend) {
        // Unsuccessfully added room
    }

    // Add authUser to friend's friends list
    let addedAuth = await updateRefData(friends.doc(friendID), {
        rooms: firebase.firestore.FieldValue.arrayUnion(authUser.uid)
    });
    if (!addedAuth) {
        // Unsuccessfully added room
    }
}

async function removeFriend(friendID) {
    // Remove friend from authUser's friends list
    let removedFriend = await updateRefData(friends.doc(authUser.uid), {
        rooms: firebase.firestore.FieldValue.arrayRemove(friendID)
    });
    if (!removedFriend) {
        // Unsuccessfully removed room
    }

    // Remove authUser from friend's friends list
    let removedAuth = await updateRefData(friends.doc(friendID), {
        rooms: firebase.firestore.FieldValue.arrayRemove(authUser.uid)
    });
    if (!removedAuth) {
        // Unsuccessfully removed room
    }
}

async function updateRoomName(roomID, newName) {
    let updated = await updateRefData(room.doc(roomID), {
        name: newName
    });
    if (!updated) {
        // Unsuccessfully updated name
    }
}

async function updateRoomDesc(roomID, newDesc) {
    let updated = await updateRefData(room.doc(roomID), {
        desc: newDesc
    });
    if (!updated) {
        // Unsuccessfully updated name
    }
}

async function createRoom(name, desc, members) {
    // Add to "room"
    let added = await addDocument(room, {
        name: name,
        desc: desc,
        members: members,
        chatEntries: []
    });
    if (!added) {
        // Unsuccessfully added room
    }

    // Add to "rooms"
    for (const id of members) {
        await addRoomToUser(added.id, id)
    }
}

async function deleteRoom(roomID, members) {
    // Remove from "room"
    let removed = await removeDocument(room.doc(roomID));
    if (!removed) {
        // Unsuccessfully removed room
    }

    // Remove from "rooms"
    for (const id of members) {
        await removeRoomFromUser(roomID, id)
    }
}

async function addMemberToRoom(memberID, roomID) {
    let added = await updateRefData(room.doc(roomID), {
        members: firebase.firestore.FieldValue.arrayUnion(memberID)
    });
    if (!added) {
        // Unsuccessfully added member
    }

    // Add to "rooms"
    await addRoomToUser(roomID, memberID);
}

async function removeMemberFromRoom(memberID, roomID) {
    let removed = await updateRefData(room.doc(roomID), {
        members: firebase.firestore.FieldValue.arrayRemove(memberID)
    });
    if (!removed) {
        // Unsuccessfully added removed
    }

    // Remove from "rooms"
    await removeRoomFromUser(roomID, memberID);
}

async function addRoomToUser(roomID, userID) {
    let added = await updateRefData(rooms.doc(userID), {
        rooms: firebase.firestore.FieldValue.arrayUnion(roomID)
    });
    if (!added) {
        // Unsuccessfully added room
    }
}

async function removeRoomFromUser(roomID, userID) {
    let removed = await updateRefData(rooms.doc(userID), {
        rooms: firebase.firestore.FieldValue.arrayRemove(roomID)
    });
    if (!removed) {
        // Unsuccessfully removed room
    }
}

/**
 * Generate random UUID
 *
 * @returns {*|string} UUID
 */
function uuid() {
    function randomDigit() {
        if (crypto && crypto.getRandomValues) {
            let rands = new Uint8Array(1);
            crypto.getRandomValues(rands);
            return (rands[0] % 16).toString(16);
        } else {
            return ((Math.random() * 16) | 0).toString(16);
        }
    }

    let crypto = window.crypto || window.msCrypto;
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, randomDigit);
}

async function addChat(roomID, fromID, message) {
    // Generate ID from encoded message truncated at 20 characters concatenated with random UUID
    let encoded = window.btoa(message);
    if (encoded.length > 20) {
        encoded = encoded.substring(0, 20);
    }
    let id = encoded + uuid();
    let obj = {};
    obj["chatEntries." + id] = {
        id: id,
        from: fromID,
        message: message
    };
    let added = await updateRefData(room.doc(roomID), obj);
    if (!added) {
        // Unsuccessfully added room
    }
}

async function removeChat(roomID, chatID) {
    let deletion = {};
    deletion["chatEntries." + chatID] = firebase.firestore.FieldValue.delete();
    let removed = await updateRefData(room.doc(roomID), deletion);
    if (!removed) {
        // Unsuccessfully removed room
    }
}

async function editChat(roomID, chatID, newMsg) {
    let update = {};
    update["chatEntries." + chatID + ".message"] = newMsg;
    let updated = await updateRefData(room.doc(roomID), update);
    if (!updated) {
        // Unsuccessfully updated room
    }
}

/**
 * Fetch data of all rooms authUser is a part of
 *
 * @returns Array Promised array of room data
 */
async function getAllRooms(roomIDs) {
    let fetchedRooms = [];

    for (const id of roomIDs) {
        let doc = await getDataFromRef(room.doc(id));
        doc['id'] = id;
        fetchedRooms.push(doc);
    }

    return fetchedRooms;
}

/**
 * Fetch uids of all authUser's friends
 *
 * @returns Array Promised friends array of authUser
 */
async function getAllFriends(friendIDs) {
    let fetchedFriends = [];

    for (const id of friendIDs) {
        let doc = await getUser(id);
        doc['id'] = id;
        fetchedFriends.push(doc);
    }

    return fetchedFriends;
}