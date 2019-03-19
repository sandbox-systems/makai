let tabs = {};
let tabPaths = {};
let activePath = null;
let collab = {
    online: [],
    canSave: false
};

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

//Breadcrumbs
function setBreadcrumb(data) {
    var crumbArray = [];
    while (!$(data).is($("#treeview"))) {
        crumbArray.push(data.text);
        data = $("#treeview").treeview("getParent", data.nodeId)
    }
    crumbArray.push("Repository");
    crumbArray.reverse();

    $("#breadcrumbs .breadcrumb").empty();
    var i = 0;
    for (i; i < crumbArray.length - 1; i++) {
        $("#breadcrumbs .breadcrumb").append('<li class="breadcrumb-item">' + crumbArray[i] + '</li>');
    }
    $("#breadcrumbs .breadcrumb").append('<li class="breadcrumb-item active">' + crumbArray[i] + '</li>');
}

/**
 * Recursive function to populate data by parsing array of full file paths mapped to file data
 */
function addFile(filename, file, path, ref) {
    if (path.length > 0) {
        if (!ref[path[0]]) {
            ref[path[0]] = {files: {}};
        }
        let newRef = ref[path[0]];
        path.shift();
        addFile(filename, file, path, newRef);
    } else {
        ref.files[filename] = file;
    }
}

/**
 * Recursive function to populate tree metadata and format to allow bootstrap-treeview to render into tree view
 */
function treeify(dataRef, treeRef) {
    Object.keys(dataRef).forEach(key => {
        if (key === "files") {
            Object.keys(dataRef[key]).forEach(filename => {
                treeRef.push({
                    id: dataRef[key][filename].id,
                    text: filename,
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                });
            })
        } else {
            let folder = {
                text: key,
                color: "#000000",
                backColor: "#C4C4C4",
                nodes: []
            };
            treeRef.push(folder);
            treeify(dataRef[key], folder.nodes);
        }
    })
}

async function handleFileDC(id) {
    let tabPath = tabPaths[id];
    // Do nothing if tab is active
    if (tabPath === activePath)
        return;
    // Is a tab already open?
    if (activePath !== null) {
        // Is selected file already open?
        if (tabs[tabPath].isOpen) {
            // Switch to that tab
            switchToTab(id);
            return;
        }
    }
    // Is it saving?
    if (tabs[tabPath].isSaving) {
        alert("TAB IS STILL SAVING!");
        return;
    }
    /*Send request for file contents*/
    /*On callback:*/
    /*Insert contents to TCA*/
    openTab(id);
    /*Insert contents into editor*/
}

function openTab(id) {
    // Find tab ref by id
    let tab = tabs[tabPaths[id]];
    tab.isOpen = true;
    // Make sure it's not active
    tab.htmlObj.removeClass("active");
    tab.htmlObj.find("a").removeClass("active");
    // Add it to the tabbar
    tab.htmlObj.appendTo('#tabbar .nav');
    switchToTab(id);
}

function getNextTab(baseTab) {
    let allTabs = $('ul.nav.nav-tabs').children().toArray();
    let baseInd = allTabs.indexOf(baseTab);

    if (allTabs.length === 1) {
        return null;
    } else if (baseInd - 1 >= 0) {
        let fileID = $(allTabs[baseInd - 1]).attr('data-fileid');
        return tabs[tabPaths[fileID]];
    } else if (baseInd + 1 < allTabs.length) {
        let fileID = $(allTabs[baseInd + 1]).attr('data-fileid');
        return tabs[tabPaths[fileID]];
    }
    // TODO Figure out rare edge case where you close a tab and there are others open but the next one isn't activated
    return null;
}

function closeTab(id) {
    let tab = tabs[tabPaths[id]];
    // Switch to next closest tab
    if (tabPaths[id] === activePath) {
        let nextTab = getNextTab(tab.htmlObj[0]);
        if (nextTab === null) {
            leaveCurrentCollabSession();
            activePath = null;
        } else {
            switchToTab(nextTab.id);
        }
    }
    tab.isOpen = false;
    // Remove tab from tabbar
    tab.htmlObj.remove();
}

async function switchToTab(id) {
    // Prepare current tab for switching
    if (activePath !== null) {
        let activeTab = tabs[activePath];
        activeTab.htmlObj.removeClass("active");
        activeTab.htmlObj.find("a").removeClass("active");
        leaveCurrentCollabSession();
        saveCurrentFile();
    }
    // Switch to new tab
    activePath = tabPaths[id];
    let newActiveTab = tabs[activePath];
    newActiveTab.htmlObj.addClass("active");
    newActiveTab.htmlObj.find("a").addClass("active");

    let wasCollabSessionCreated = !(await doesCollabSessionExist(id));
    /*Join collab session*/
    joinExistingCollabSession(id);
    // Does collab session exist for file?
    // if (await doesCollabSessionExist(id)) {
    //     // /*Join collab session*/ joinExistingCollabSession(id);
    //     openTab(id);
    //     return;
    // }
    /*Create collab session*/
    if (wasCollabSessionCreated) {
        collab.canSave = true;
        setCollabSessionOwner(id, true);
    }
}

function saveCurrentFile() {
    if (!collab.canSave)
        return;
    let tab = tabs[activePath];
    let editorVal = editor.getSession().getValue();
    // Was file edited?
    if (tab.contents !== editorVal) {
        tab.contents = editorVal;
        tab.isSaving = true;
        firestore.collection('file_changes').doc(tab.id.toString()).set({contents: editorVal})
            .then(function (docRef) {
                tab.isSaving = false;
            })
            .catch(function (error) {
                /*TODO Handle error saving*/
            });
    }
}

function doesCollabSessionExist(id) {
    return new Promise(resolve => {
        // var editor = ace.edit("editor");
        // editor.setOptions(editorOptions);
        realtime.ref(id).once('value').then(function (snapshot) {
            resolve(snapshot.exists());
        });
    });
}

function setupEditor() {
    let editorDiv = $('<div />').appendTo($('#editorContainer'));
    editorDiv.attr('id', 'editor');
    editor = ace.edit("editor");
    editor.setOptions(editorOptions);
}

function joinExistingCollabSession(id) {
    setupEditor();
    // Get or upsert reference to location in db where data with id is stored
    let ref = realtime.ref(id);
    // // Add current username to users list
    // ref.child("users").child(username).set({
    //     username: username
    // });
    // Bind editor to firepad
    Firepad.fromACE(ref, editor, {userId: uid});
    // Update online list with added or removed children
    ref.child("users").on("child_added", childSnapshot => {
        // Push added child to online list as appropriate
        let childID = childSnapshot.key;
        // TODO Change accordingly
        if (childID === "?owner") {
            return;
        }
        // console.log(childSnapshot.node_.children_.root_);
        if (childID !== uid && !collab.online.includes(childID)) {
            collab.online.push(childID);
        }
    });
    ref.child("users").on("child_removed", oldChildSnapshot => {
        // Pop removed child from online list as appropriate
        let childID = oldChildSnapshot.key;
        // TODO Change accordingly
        if (childID === "?owner") {
            return;
        }
        let ind = collab.online.indexOf(childID);
        if (childID !== uid && ind !== -1) {
            collab.online.splice(ind, 1);
            // let fullPath = active_path + (active_path === "" ? "" : "/") + active_name;
            // if (!fileFlags[fullPath].canSave) {
            //     // Allow this user to save if he/she is the new owner
            //     fetchCreatorUsername(collab.id, function (creator) {
            //         fileFlags[fullPath].canSave = username === creator;
            //     });
            // }
        }
    });
    ref.child("users").on("child_changed", childSnapshot => {
        // Pop removed child from online list as appropriate
        let childID = childSnapshot.key;
        // TODO Change accordingly
        if (childID === "?owner") {
            let newOwnerID = childSnapshot.node_.children_.root_.value.value_;
            if (newOwnerID === uid) {
                collab.canSave = true;
            }
            // return;
        }
        // let ind = collab.online.indexOf(childID);
        // if (childID !== uid && ind !== -1) {
        //     collab.online.splice(ind, 1);
        //     // let fullPath = active_path + (active_path === "" ? "" : "/") + active_name;
        //     // if (!fileFlags[fullPath].canSave) {
        //     //     // Allow this user to save if he/she is the new owner
        //     //     fetchCreatorUsername(collab.id, function (creator) {
        //     //         fileFlags[fullPath].canSave = username === creator;
        //     //     });
        //     // }
        // }
    });
}

function leaveCurrentCollabSession() {
    let id = getKeyByValue(tabPaths, activePath);
    realtime.ref(id).child("users").child(uid).remove();
    setCollabSessionOwner(id, false);
    $('#editorContainer').empty();
}

function setCollabSessionOwner(id, setToCurrentUser) {
    let ref = realtime.ref(id);

    if (setToCurrentUser) {
        // TODO Change ?owner delimiter to containing character not allowed in UID
        ref.child("users").child("?owner").set({
            uid: uid
        });
    } else {
        // If this user is owner and other users are online, transfer ownership
        // If no other users are online, delete collab session
        if (collab.canSave) {
            if (collab.online.length > 0) {
                ref.child("users").child("?owner").set({
                    uid: collab.online[0]
                });
            } else {
                ref.remove();
            }
        }
    }
}