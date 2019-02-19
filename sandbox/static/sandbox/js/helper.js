let tabs = {};
let tabPaths = {};
let activePath = null;

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

function handleFileDC(id) {
    let tabPath = tabPaths[id];
    if (tabPath === activePath)
        return;
    if (activePath !== null) {
        if (tabs[tabPath].isOpen) {
            switchToTab(id);
            return;
        }
    }
    openTab(id);
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
            activePath = null;
        } else {
            switchToTab(nextTab.id);
        }
    }
    tab.isOpen = false;
    // Remove tab from tabbar
    tab.htmlObj.remove();
}

function switchToTab(id) {
    if (activePath !== null) {
        let activeTab = tabs[activePath];
        activeTab.htmlObj.removeClass("active");
        activeTab.htmlObj.find("a").removeClass("active");
    }
    activePath = tabPaths[id];
    let newActiveTab = tabs[activePath];
    newActiveTab.htmlObj.addClass("active");
    newActiveTab.htmlObj.find("a").addClass("active");
}

function saveFile() {

}