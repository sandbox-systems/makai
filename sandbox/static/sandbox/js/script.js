//ACE Editor
var editor = ace.edit("editor");
editor.setOptions({
    // editor options
    selectionStyle: 'line',// "line"|"text"
    highlightActiveLine: true, // boolean
    highlightSelectedWord: true, // boolean
    readOnly: false, // boolean: true if read only
    cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
    mergeUndoDeltas: true, // false|true|"always"
    behavioursEnabled: true, // boolean: true if enable custom behaviours
    wrapBehavioursEnabled: true, // boolean
    autoScrollEditorIntoView: undefined, // boolean: this is needed if editor is inside scrollable page
    keyboardHandler: null, // function: handle custom keyboard events

    // renderer options
    animatedScroll: false, // boolean: true if scroll should be animated
    displayIndentGuides: false, // boolean: true if the indent should be shown. See 'showInvisibles'
    showInvisibles: false, // boolean -> displayIndentGuides: true if show the invisible tabs/spaces in indents
    showPrintMargin: true, // boolean: true if show the vertical print margin
    printMarginColumn: 80, // number: number of columns for vertical print margin
    printMargin: undefined, // boolean | number: showPrintMargin | printMarginColumn
    showGutter: true, // boolean: true if show line gutter
    fadeFoldWidgets: false, // boolean: true if the fold lines should be faded
    showFoldWidgets: true, // boolean: true if the fold lines should be shown ?
    showLineNumbers: true,
    highlightGutterLine: false, // boolean: true if the gutter line should be highlighted
    hScrollBarAlwaysVisible: false, // boolean: true if the horizontal scroll bar should be shown regardless
    vScrollBarAlwaysVisible: false, // boolean: true if the vertical scroll bar should be shown regardless
    fontSize: 12, // number | string: set the font size to this many pixels
    fontFamily: undefined, // string: set the font-family css value
    maxLines: undefined, // number: set the maximum lines possible. This will make the editor height changes
    minLines: undefined, // number: set the minimum lines possible. This will make the editor height changes
    maxPixelHeight: 0, // number -> maxLines: set the maximum height in pixel, when 'maxLines' is defined.
    scrollPastEnd: 0, // number -> !maxLines: if positive, user can scroll pass the last line and go n * editorHeight more distance
    fixedWidthGutter: false, // boolean: true if the gutter should be fixed width
    theme: 'ace/theme/textmate', // theme string from ace/theme or custom?

    // mouseHandler options
    scrollSpeed: 2, // number: the scroll speed index
    dragDelay: 0, // number: the drag delay before drag starts. it's 150ms for mac by default
    dragEnabled: true, // boolean: enable dragging
    focusTimeout: 0, // number: the focus delay before focus starts.
    tooltipFollowsMouse: true, // boolean: true if the gutter tooltip should follow mouse

    // session options
    firstLineNumber: 1, // number: the line number in first line
    overwrite: false, // boolean
    newLineMode: 'auto', // "auto" | "unix" | "windows"
    useWorker: true, // boolean: true if use web worker for loading scripts
    useSoftTabs: false, // boolean: true if we want to use spaces than tabs
    tabSize: 4, // number
    wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
    indentedSoftWrap: true, // boolean
    foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.
    mode: 'ace/mode/java', // string: path to language mode

    // code snippets
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
});

//Tree View
function getTree() {
    var data = [
        {
            text: "My Website",
            color: "#000000",
            backColor: "#C4C4C4",
            nodes: [
                {
                    text: "home.html",
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                },
                {
                    text: "aboutme.java",
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                },
                {
                    text: "file1.java",
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                },
                {
                    text: "file2.java",
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                },
                {
                    text: "contact.py",
                    icon: "glyphicon glyphicon-file",
                    color: "#000000",
                    backColor: "#C4C4C4"
                },
                {
                    text: "Other Sites",
                    color: "#000000",
                    backColor: "#C4C4C4",
                    nodes: [
                        {
                            text: "resume",
                            icon: "glyphicon glyphicon-file",
                            color: "#000000",
                            backColor: "#C4C4C4"
                        },
                        {
                            text: "blog",
                            icon: "glyphicon glyphicon-file",
                            color: "#000000",
                            backColor: "#C4C4C4"
                        }
                    ]
                }
            ],
        }
    ];

    return data;
}

$('#treeview').treeview({
    data: getTree(),
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
    console.log(clicks);
    if (clicks === 1) {
        timer = setTimeout(function () {
            $('#treeview').treeview('toggleNodeExpanded', [parseInt(event.target.dataset.nodeid), {silent: false}]);
            clicks = 0;
        }, 200);
    } else {
        if ($(event.target).find("span.expand-icon").length == 0)
            addTab(event.target.innerText);
        clicks = 0;
    }
}).on("dblclick", function (event) {
    event.preventDefault();
});

$(function(){
    $('#treeview').contextMenu({
        selector: '.node-treeview',
        zIndex:10,
        callback: function(key, options) {
            // var m = "clicked: " + key + " on " + $(this).text();
            // window.console && console.log(m) || alert(m);
        },
        items: {
            "new": {
                name: "New",
                icon: "fas fa-plus",
                disabled: function(){
                    return !($(this).context.innerHTML.includes("chevron-down"));
                },
                items:{
                    "newfile": {
                        name: "New File",
                        icon:'fas fa-file',
                        items:{
                            "filename":{
                                name: "Filename",
                                type: 'text',
                                events:{
                                    keyup: function(e){
                                        //FUNCTION TO CREATE NEW FILE
                                    }
                                }
                            }
                        }
                    },
                    "newfolder": {
                        name: "New Folder",
                        icon: "fas fa-folder",
                        items:{
                            "foldername":{
                                name: "Foldername",
                                type: 'text',
                                events:{
                                    keyup: function(e){
                                        //FUNCTION TO CREATE NEW FOLDER
                                    }
                                }
                            }
                        }
                    }
                }
                }
                ,
            "rename ": {name: "Rename", icon: "edit"},
            "duplicate": {name: "Duplicate", icon: "copy"},
            "delete": {name: "Delete", icon: "delete"},
            // "sep1": "---------",
            // "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
        }
    });
});

//Breadcrumbs
function setBreadcrumb(data) {
    var crumbArray = [];
    while (!$(data).is($("#treeview"))) {
        // console.log(data);
        crumbArray.push(data.text);
        data = $("#treeview").treeview("getParent", data.nodeId)
    }
    crumbArray.push("Repository");
    crumbArray.reverse();
    // console.log(crumbArray);

    $("#breadcrumbs .breadcrumb").empty();
    var i = 0;
    for (i; i < crumbArray.length - 1; i++) {
        $("#breadcrumbs .breadcrumb").append('<li class="breadcrumb-item">' + crumbArray[i] + '</li>');
    }
    $("#breadcrumbs .breadcrumb").append('<li class="breadcrumb-item active">' + crumbArray[i] + '</li>');
}

//Tab Bar
var tabnum = 0;
var sessions = {};
var changedFiles = [];
var folderDownloaded = "";

$('#tabbar').on('click', 'a', function (e) {
    console.log(this);
    e.preventDefault();
    activateTab($(this));
});

function addTab(name) {
    var ext = name.substring(name.lastIndexOf(".")+1);
    var lang = "";
    $('<li><a href="#tab' + (++tabnum) + '" data-toggle="tab">' + name + '<span class="close">&nbsp;&nbsp;×</span></a></li>').appendTo('#tabbar .nav');
    if(!(name in sessions)){
        switch(ext){
            case "java":
                lang = "ace/mode/java";
                break;
            case "py":
                lang = "ace/mode/python";
                break;
            case "html":
                lang = "ace/mode/html";
                break;
            case "js":
                lang = "ace/mode/javascript";
                break;
            case "php":
                lang = "ace/mode/php";
                break;
            default:
                lang = "ace/mode/text";
                break;
        }
        sessions[name] = ace.createEditSession("", lang);
    }
    activateTab($('#tabbar .nav a:last'));
}

function activateTab(tab){
    $("#tabbar a.active").removeClass("active").removeClass("show");
    tab.addClass("show");
    tab.addClass("active");
    name = tab.html().split('<span class="close">&nbsp;&nbsp;×</span>')[0];
    editor.setSession(sessions[name]);
    console.log("activated");

    if(changedFiles.indexOf(name)==-1)
        changedFiles.push(name);

    console.log(changedFiles);
}

$("#tabbar").on('click', 'span', function (event) {
    event.stopPropagation();
    var tabContentId = $(this).parent().attr("href");
    $(this).parent().parent().remove();
    $(tabContentId).remove();
    if($(this).parent().hasClass("active") && $("#tabbar a").size()>0){
        activateTab($("#tabbar .nav a:last"));
    }
});

//Toolbar
$("#runButton").click(function(){
    if(folderDownloaded==""){
        //download current folder
        changedFiles.forEach(function(file){
            termPost({
                action: "download",
                path: "src/"+file,
                code: sessions[file].getValue(),
            });
        });
    }

    termPost({
        action: "run",
        filename: $('#tabbar .show.active')[0].innerHTML.split("<")[0],
        code: editor.getValue(),
        breakpoints: breakpointList.map(function(value){return value+1})
    });
});

//Live Editor
function toggleLive(){
    if($("#editor").hasClass("debugview")) {
        Swal.fire({
            type: 'error',
            title: 'Please Toggle Debugger To Enable Live Preview'
        });
    }else {
        $("#editor").toggleClass("liveview");
        if ($("#editor").hasClass("liveview")) {
            $("#livedisplay").css("display", "block");
            editor.addEventListener("change", updateLiveData);
            updateLiveData();
            $("#editor").css("width", "50%");
        } else {
            $("#livedisplay").css("display", "none");
            editor.removeEventListener("change", updateLiveData);
            $("#editor").css("width", "100%");
        }
    }
}

function updateLiveData(){
    $("#livedisplayFrame").contents().find("html").html(editor.getValue());
}

//Debugger
function toggleDebug(){
    if($("#editor").hasClass("liveview")) {
        toggleLive();
    }
    $("#editor").toggleClass("debugview");
    if($("#editor").hasClass("debugview")){
        $("#debug").css("display", "block");
        $("#editor").css("width", "50%");
    }else{
        $("#debug").css("display", "none");
        $("#editor").css("width", "100%");
    }
}


var debug = false;
var breakpointAnchors = [];
var breakpointList = [];
$("#debugButton").click(function () {
    toggleDebug();
    debug = !debug;

    if(!debug)
        return;

    termPost({
        action: "debug",
        filename: $('#tabbar .show.active')[0].innerHTML.split("<")[0],
        code: editor.getValue(),
        breakpoints: breakpointList.map(function(value){return value+1})
    });
});

$("#debugStart").click(function(){
    if(!debug)
        return;

    termPost({
        action: "start",
    });
});

$("#debugPause").click(function(){
    if(!debug)
        return;

    //termPost({

    //});
});

$("#debugCont").click(function(){
    if(!debug)
        return;

    termPost({
        action: "debugCont"
    });
});

$("#debugStepOver").click(function(){
    if(!debug)
        return;

    termPost({
        action: "debugStepOver"
    });
});

$("#debugStepInto").click(function(){
    if(!debug)
        return;

    termPost({
        action: "debugStepInto"
    });
});

$("#debugStepOut").click(function(){
    if(!debug)
        return;

    termPost({
        action: "debugStepOut"
    });
});

editor.on("guttermousedown", function (e) {
    var target = e.domEvent.target;
    if (target.className.indexOf("ace_gutter-cell") == -1) //make sure that user clicked on a gutter cell
        return;
    var breakpoints = e.editor.session.getBreakpoints(row, 0);
    var row = e.getDocumentPosition().row;
    if (typeof breakpoints[row] === typeof undefined) { //add breakpoint
        breakpointList.push(row);
        e.editor.session.setBreakpoint(row);
        breakpointAnchors.push(editor.getSession().getDocument().createAnchor(row, 0));
        breakpointAnchors[breakpointAnchors.length - 1].on("change", function (element) {
            e.editor.session.clearBreakpoint(element.old.row); //moves breakpoint in sync with line of code
            e.editor.session.setBreakpoint(element.value.row);
        });
    } else { //delete breakpoint
        breakpointList.splice(breakpointList.indexOf(row),1);
        e.editor.session.clearBreakpoint(row);
        breakpointAnchors.forEach(function (element, index) {
            if (row == element.row) {
                element.detach();
                breakpointAnchors.splice(index, 1);
            }
        });
    }
    e.stop();
});

var Range = ace.require('ace/range').Range;

function setCurrentDebugLine(num){
    if(!debug) return;
    return editor.session.addMarker(new Range(num-1, 0, num-1, 1), "currentDebugLine", "fullLine");
}

function clearMarker(marker){
    editor.getSession().removeMarker(marker);
}

//Terminal Communications

function termPost(parameters){
    document.getElementById("terminalFrame").contentWindow.postMessage(parameters, "http://localhost:7681");
}

window.addEventListener("message", function(event){
    switch(event.data.action){
    }
});

//Theme
function changeTheme(theme) {
    var lightThemes = ["chrome", "clouds", "crimson_editor", "dawn", "eclipse", "solarized_light", "tommorow", "textmate"];
        if(lightThemes.includes(editor.getTheme().substring(editor.getTheme().lastIndexOf("/")+1)) && !lightThemes.includes(theme)){
            document.documentElement.setAttribute('data-theme', 'dark');
        }else if(!lightThemes.includes(editor.getTheme().substring(editor.getTheme().lastIndexOf("/")+1)) && lightThemes.includes(theme)){
            document.documentElement.setAttribute('data-theme', 'light');
        }
        editor.setTheme("ace/theme/" + theme);
}

$(document).ready(function () {
    $("#editorcol").resizable({
        handles: 'w',
        resize: function(e,ui){
            $("#treeview").width(($(window).width() - 70) - $("#editorcol").width());
        }
    });
    $("#livedisplay").resizable({
        handles: 'w',
        start: function(e, ui){
            $("#livedisplay").css("pointer-events", "none");
            $("#livedisplay").css("display", "none");
        },
        resize: function(e,ui){
            var temp = ($("#editorcol").width() - $("#livedisplay").width()-2);
            $("#editor").css('width', temp, 'important');
            $("#livedisplay").css("display", "inline-block");
        }, stop: function(e, ui){
            $("#livedisplay").css("pointer-events", "auto");
            $("#livedisplay").css("display", "block");
        }
    });
    $("#terminal").resizable({
        handles: 'n',
        start: function(e, ui){
            $("#terminalframe").css("pointer-events", "none");
            $("#terminalframe").css("display", "none");
        },
        resize: function(e,ui){
            var nheight = $(window).height() - $("#terminal").height() - $("#tabbar").height();
            document.getElementById("editor").style.height = nheight;
            document.getElementById("livedisplay").style.height = nheight;
            document.getElementById("debug").style.height = nheight;
        },
        stop: function(e, ui){
            $("#terminalframe").css("pointer-events", "auto");
            $("#terminalframe").css("display", "block");
        }
    });
    $(window).resize(function () {
        // var nheight = $(window).height() - $("#terminal").height() - $("#tabbar").height();
        // document.getElementById("editor").style.height = nheight;
        // document.getElementById("livedisplay").style.height = nheight;
        $("#treeview").width(($(window).width() - 75) - $("#editorcol").width());
    });
});