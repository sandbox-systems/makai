//Tree View
var data = {files: {}};
let tree = [];

let tabNum = 0;
Object.keys(files).forEach(pathStr => {
    let path = pathStr.split('/');
    let filename = path.pop();
    addFile(filename, files[pathStr], path, data);

    let htmlObj = $('<li class="fileTab" data-fileid="' + files[pathStr].id + '"><a href="#tab' + (++tabNum) + '" data-toggle="tab">' + filename + '<span class="close">&nbsp;&nbsp;×</span></a></li>');
    htmlObj.find("a").click(function (e) {
        e.preventDefault();
        // Ensure tab was clicked, not close button
        if ($(e.target).prop('nodeName') === "A") {
            // Activate tab
            $(this).tab('show');
            // Set activePath
            let tabFileID = $(this).parent().attr("data-fileid");
            activePath = tabPaths[tabFileID];
        }
    });
    tabs[pathStr] = {
        id: files[pathStr].id,
        contents: files[pathStr].contents,
        isOpen: false,
        isSaving: false,
        htmlObj: htmlObj
    };
    tabPaths[files[pathStr].id] = pathStr;
});

treeify(data, tree);

$('#treeview').treeview({
    data: tree,
    levels: 1,
    expandIcon: "glyphicon glyphicon-chevron-down",
    collapseIcon: "glyphicon glyphicon-chevron-up"
});

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
$('#tabbar a').click(function (e) {
    e.preventDefault();
    // Activate tab
    $(this).tab('show');
    // Set activePath
    var tabFileID = $(this).parent().attr("data-fileid");
    activePath = tabPaths[tabFileID];
});

$("#tabbar").on('click', 'span', function () {
    var tabFileID = $(this).parent().parent().attr("data-fileid");
    closeTab(tabFileID);
});

//Toolbar
$("#runButton").click(function () {
    document.getElementById("terminalFrame").contentWindow.postMessage({
        filename: $('#tabbar .show.active')[0].innerHTML.split("<")[0],
        code: editor.getValue()
    }, "http://127.0.0.1:7681");
});