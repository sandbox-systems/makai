let tabs = {};
let tabPaths = {};
let activeRepo = null;
let activePath = null;
let collab = {
    online: [],
    canSave: false
};
let modelist = ace.require('ace/ext/modelist');
let languageTools = ace.require('ace/ext/language_tools');

/**
 * Extract filename from path (should be rightmost node)
 */
function getFilenameFromPath(path) {
    let nodes = path.split('/');
    return nodes.pop();
}

function populateFiles(repo) {
    return new Promise(resolve => {
        // Send request to castle endpoints so python handles loading and processing saved changes to repo
        // TODO axios
        $.ajax({
            type: "POST",
            url: "/castle/{0}/{1}/{2}/{3}".format(repo.hostName, repo.owner, repo.name, repo.branch),
            data: {},
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function (data, status, xhttp) {
                Object.keys(data).forEach(fullPath => {
                    let path = fullPath.replace("master/", ""); // TODO generalize branch
                    let datum = data[fullPath];
                    if (datum.type === "file") {
                        files[path] = {
                            id: datum.id,
                            repo_id: datum.repo_id,
                            contents: datum.content
                        };
                    }
                    activeRepo.id = datum.repo_id;
                });
                resolve();
            }, error: function (data) {
                console.log(data);
            },
            dataType: "json"
        });
    });
}

function bindFileChanges() {
    /*if (Object.keys(tabs).length === 0)
        return;
    let repo_id = tabs[Object.keys(tabs)[0]].repo_id;
    firestore.collection('file_changes').doc(repo_id)
        .onSnapshot(snapshot => {
            Object.keys(snapshot.data()).forEach(fullPath => {
                let changeToThisFile = snapshot.data()[Firebase.firebasePathEncode(fullPath)];
                // TODO 2 only add and del, upd handled by tab click handler
                // fullPath contains branch, filePath doesn't
                // TODO 1 replace master with arbitrary branch
                let filePath = fullPath.replace('master/', '');
                let tab = tabs[filePath];
                // if (changeToThisFile.type === "add" && !tab) {
                //     let newTab = {
                //         id: changeToThisFile.file_id,
                //         repo_id: repo_id,
                //         contents: "",
                //         // TODO 1 add other parts of tab (including html object to be generated--create function for it)
                //     };
                //     let pathArr = filePath.split('/');
                //     tabs.push(newTab);
                //     // TODO 1 test to make sure data is defined
                //     addFile(changeToThisFile.name, newTab, pathArr, data);
                // } else if (changeToThisFile.type === "del" && tab) {
                //     // Delete tab
                // } else if (changeToThisFile.type === "upd" && tab && activePath !== filePath) {
                //     tab.content = changeToThisFile.content;
                // }
            });
        });*/
}

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
    crumbArray.push($("#breadcrumbs ul li").first().text());
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
function addFile(filename, file, pathArr, ref) {
    if (pathArr.length > 0) {
        if (!ref[pathArr[0]]) {
            ref[pathArr[0]] = {files: {}};
        }
        let newRef = ref[pathArr[0]];
        pathArr.shift();
        addFile(filename, file, pathArr, newRef);
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
                    icon: "fas fa-file",
                    color: "black",
                    backColor: "ghostwhite"
                });
            })
        } else {
            let folder = {
                text: key,
                color: "black",
                backColor: "ghostwhite",
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

async function closeTab(id) {
    let tab = tabs[tabPaths[id]];
    // Switch to next closest tab
    if (tabPaths[id] === activePath) {
        let nextTab = getNextTab(tab.htmlObj[0]);
        if (nextTab === null) {
            await leaveAndSaveCurrentCollabSession();
            activePath = null;
        } else {
            await switchToTab(nextTab.id);
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
        await leaveAndSaveCurrentCollabSession();
    }
    // Switch to new tab
    activePath = tabPaths[id]; // Update activePath with new tab
    let newActiveTab = tabs[activePath];
    newActiveTab.htmlObj.addClass("active");
    newActiveTab.htmlObj.find("a").addClass("active");

    newActiveTab.contents = await getFileContents(activePath);

    let wasCollabSessionCreated = !(await doesCollabSessionExist(id));
    /*Join collab session*/
    joinCollabSession(id, wasCollabSessionCreated);
    // Does collab session exist for file?
    // if (await doesCollabSessionExist(id)) {
    //     // /*Join collab session*/ joinCollabSession(id);
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
    return new Promise(resolve => {
        if (collab.canSave) {
            let tab = tabs[activePath];
            let editorVal = editor.getSession().getValue();
            // Was file edited?
            if (tab.contents !== editorVal) { // TODO bc of this, don't update tab.contents anywhere else
                tab.contents = editorVal;
                tab.isSaving = true;

                // Construct update object mapping to add to firebase
                let fullPath = Firebase.firebasePathEncode("master/" + activePath); // TODO generalize branch
                let changeObj = {
                    branch_parent: "master_" + activePath, // TODO generalize branch
                    file_id: tab.id.toString(),
                    name: getFilenameFromPath(activePath),
                    type: "upd",
                    content: tab.contents
                };

                // Construct document update object containing mapping
                let docUpdate = {};
                docUpdate[fullPath] = changeObj;

                // Update firebase
                firestore.collection('file_changes').doc(tab.repo_id.toString()).set(docUpdate, {merge: true})
                    .then(() => {
                        tab.isSaving = false;
                        resolve();
                    })
                    .catch(error => {
                        /*TODO Handle error saving*/
                        console.log(error);
                        resolve();
                    });
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
}

function fetchOriginalContents(path) {
    return new Promise(async resolve => {
        resolve(await hosts.github.getFileContents(activeRepo.owner, activeRepo.name, path))
    });
}

function getFileContents(path) {
    return new Promise(async resolve => {
        let change = await fetchChangesToFile(path);
        if (change) {
            switch (change.type) {
                case 'add':
                    resolve('');
                    break;
                case 'upd':
                    resolve(change.content);
                    break;
            }
        } else {
            resolve(await fetchOriginalContents(path));
        }
    });
}

function fetchChangesToFile(path) {
    let full_path = Firebase.firebasePathEncode('master/' + path); // TODO generalize branch
    return new Promise(resolve => {
        firestore.collection('file_changes').doc(tabs[path].repo_id.toString()).get()
            .then(doc => {
                let changesAtPath = doc.data()[full_path];
                if (!doc.exists || !changesAtPath) {
                    resolve(false);
                } else {
                    resolve(changesAtPath);
                }
            })
            .catch(err => {
                resolve(false);
                // TODO Handle error
            });
    });
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
    setSessionMode(editor.session, activePath);
    bindEditorBreakpoints();
}

function setSessionMode(session, filepath){
    session.setMode(modelist.getModeForPath(filepath).mode);
}

function joinCollabSession(id, shouldCreate) {
    setupEditor();
    // Get or upsert reference to location in db where data with id is stored
    let ref = realtime.ref(id);
    // // Add current username to users list
    // ref.child("users").child(username).set({
    //     username: username
    // });
    // Bind editor to firepad
    Firepad.fromACE(ref, editor, {userId: uid});
    // Set editor text to file contents
    if (shouldCreate) {
        editor.setValue(tabs[activePath].contents, -1);
    }
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

/**
 * @return  true: other users were online and session ownership transferred to one of them
 *          false: no other users were online and session deleted
 */
function leaveCurrentCollabSession() {
    return new Promise(resolve => {
        // Remove user from file's users
        let id = getKeyByValue(tabPaths, activePath);
        realtime.ref(id).child("users").child(uid).remove();

        // Set new owner, if viable
        let wasOwnershipTransferred = setCollabSessionOwner(id, false);

        // Remove editor binding to session
        $('#editorContainer').empty();

        // Reset local collab data (except for canSave, which can't be reset until potential save is done (see
        // leaveAndSaveCurrentCollabSession)
        collab.online.splice(0, collab.online.length);

        resolve(wasOwnershipTransferred);
    });
}

/**
 * Save file associated with session if ownership wasn't transferred (indicating this user was last collaborator on file
 * and should save final changes as they will not be handled by auto-save from someone else)
 */
async function leaveAndSaveCurrentCollabSession() {
    return new Promise(async resolve => {
        let wasOwnershipTransferred = await leaveCurrentCollabSession();
        if (!wasOwnershipTransferred) {
            await saveCurrentFile();
        }
        // Reset remaining local collab data
        collab.canSave = false;
        resolve();
    });
}

/**
 * @return  true: other users were online and session ownership transferred to one of them
 *          false: no other users were online and session deleted
 *          null: setToCurrentUser was true
 */
function setCollabSessionOwner(id, setToCurrentUser) {
    let ref = realtime.ref(id);

    if (setToCurrentUser) {
        // TODO Change ?owner delimiter to containing character not allowed in UID
        ref.child("users").child("?owner").set({
            uid: uid
        });
        return null;
    } else {
        // If this user is owner and other users are online, transfer ownership
        // If no other users are online, delete collab session
        if (collab.canSave) {
            if (collab.online.length > 0) {
                ref.child("users").child("?owner").set({
                    uid: collab.online[0]
                });
                return true;
            } else {
                ref.remove();
                return false;
            }
        }
    }
}

//TODO Moving Tabs
//
// $(function () {
//     let tabs = $("#tabar").tabs();
//     tabs.find(".ui-tabs-nav").sortable({
//         axis: "x",
//         stop: function () {
//             tabs.tabs("refresh");
//         }
//     });
// });