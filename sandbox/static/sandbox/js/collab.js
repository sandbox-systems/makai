$(function () {
    $('#treeview').contextMenu({
        selector: '.node-treeview',
        zIndex: 10,
        callback: function (key, options) {
            // var m = "clicked: " + key + " on " + $(this).text();
            // window.console && console.log(m) || alert(m);
        },
        items: {
            "new": {
                name: "New",
                icon: "fas fa-plus",
                disabled: function () {
                    // return !($(this).context.innerHTML.includes("chevron-down"));
                },
                items: {
                    "newfile": {
                        name: "New File",
                        icon: 'fas fa-file',
                        items: {
                            "filename": {
                                name: "Filename",
                                type: 'text',
                                events: {
                                    keyup: function (e) {
                                        //FUNCTION TO CREATE NEW FILE
                                    }
                                }
                            }
                        }
                    },
                    "newfolder": {
                        name: "New Folder",
                        icon: "fas fa-folder",
                        items: {
                            "foldername": {
                                name: "Foldername",
                                type: 'text',
                                events: {
                                    keyup: function (e) {
                                        //FUNCTION TO CREATE NEW FOLDER
                                    }
                                }
                            }
                        }
                    }
                }
            }
            ,
            "rename ": {name: "Rename", icon: "fas fa-edit"},
            "duplicate": {name: "Duplicate", icon: "fas fa-copy"},
            "delete": {name: "Delete", icon: "fas fa-trash"},
            // "sep1": "---------",
            // "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
        }
    });
});

//Tree View
var data = {files: {}};
let tree = [];
let hosts;
let repos;

async function load() {
    await init();
    console.log("Initialized");

    hosts = {
        github: new Github(tokens['github']),
        bitbucket: new Github(tokens['github'])
    }
    console.log("Set up hosts");

    repos = await getAllRepos();
    console.log("Fetched all repos");
}

async function setupEventHandlers() {
    $('#treeview').on('nodeSelected', function (event, data) {
        setBreadcrumb(data);
    });

    var clicks = 0;
    var timer = null;

    $("#treeview").on("click", function (event) {
        clicks++;
        if (clicks === 1) {
            timer = setTimeout(function () {
                $('#treeview').treeview('toggleNodeExpanded', [parseInt(event.target.dataset.nodeid), {silent: false}]);
                clicks = 0;
            }, 200);
        } else {
            if ($(event.target).find("span.expand-icon").length === 0) {
                // Open appropriate tab on double click
                let fileID = $(event.target).attr('data-fileid');
                handleFileDC(fileID);
            }
            clicks = 0;
        }
    }).on("dblclick", function (event) {
        event.preventDefault();
    });

    //Tab Bar
    /**TODO CHECK THIS**/
    /*$('#tabbar a').click(function (e) {
        e.preventDefault();
        // // Activate tab
        // $(this).tab('show');
        // // Set activePath
        // var tabFileID = $(this).parent().attr("data-fileid");
        // activePath = tabPaths[tabFileID];
    });*/

    $("#tabbar").on('click', 'span', function () {
        var tabFileID = $(this).parent().parent().attr("data-fileid");
        closeTab(tabFileID);
    });

    //Toolbar
    //TODO delete if everything runs fine without this
    /*$("#runButton").click(function () {
        document.getElementById("terminalFrame").contentWindow.postMessage({
            filename: $('#tabbar .show.active')[0].innerHTML.split("<")[0],
            code: editor.getValue()
        }, "http://127.0.0.1:7681");
    });*/

    $(window).on("beforeunload", function () {
        leaveAndSaveCurrentCollabSession();
    });

    $("#commitButton").click(() => {
        bitbucket.commit("Shriggs", "makai-test", activeRepo.id, "master", "An even newer commit")
        // github.commit("makaide", "test", "9264fd2810f564a78db33766132bcf997184661fa94a8fe5ccb19ba61c4c0873d391e987982fbbd3", "master", "A newer commit")
    });
}

async function initRepo(repo) {
    repo.setHost(hosts[repo.hostName]);
    activeRepo = repo;

    //Set repo for breadcrumbs
    $("#breadcrumbs ul li").first().text(repo.name);

    await populateFiles(repo);

    let tabNum = 0;
    Object.keys(files).forEach(pathStr => {
        let pathArr = pathStr.split('/');
        let filename = pathArr.pop();
        // Parse array of full paths to recursive tree contained in data
        addFile(filename, files[pathStr], pathArr, data);

        let htmlObj = $('<li class="fileTab" data-fileid="' + files[pathStr].id + '"><a href="#tab' + (++tabNum) + '" data-toggle="tab" class="nav-link">' + filename + '<span class="close">&nbsp;&nbsp;×</span></a></li>');
        htmlObj.find("a").click(function (e) {
            e.preventDefault();
            // Ensure tab was clicked, not close button
            if ($(e.target).prop('nodeName') === "A") {
                let tabFileID = $(this).parent().attr("data-fileid");
                if (tabPaths[tabFileID] !== activePath) {
                    switchToTab(tabFileID);
                }
                return false;
                // // Activate tab
                // $(this).tab('show');
                // // Set activePath
                // let tabFileID = $(this).parent().attr("data-fileid");
                // activePath = tabPaths[tabFileID];
            }
        });
        tabs[pathStr] = {
            id: files[pathStr].id,
            repo_id: files[pathStr].repo_id,
            contents: files[pathStr].contents,
            isOpen: false,
            isSaving: false,
            htmlObj: htmlObj
        };
        tabPaths[files[pathStr].id] = pathStr;
    });

    bindFileChanges();

    treeify(data, tree);

    $('#treeview').treeview({
        data: tree,
        levels: 1,
        expandIcon: "fas fa-folder",
        collapseIcon: "fas fa-folder-open",
        selectedBackColor: "rebeccapurple",
        showBorder: false
    });
}

(async () => {
    await load();
    console.log("Sandbox loaded");

    repos.forEach(repo => {
        let noRepoSelectedOverlay = $('#noRepoSelectedOverlay');
        let repoList = $('#repoList');
        let openRepoContainer = $('#openRepo');

        let selectRepoBtn = $('<li>');
        selectRepoBtn.text(repo.name);
        selectRepoBtn.click(async () => {
            noRepoSelectedOverlay.hide();
            openRepoContainer.show();
            // TODO add x-ing out of repo so hiding of these containers must be switched
            await initRepo(repo);
            console.log("Initialized repo");
            await setupEventHandlers();
            console.log("Set up event handlers");
        });
        repoList.append(selectRepoBtn);
    });
})();