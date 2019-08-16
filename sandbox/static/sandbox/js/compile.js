//Tab Bar
// TODO save ace session in FB instead of just contents
var changedFiles = [];
var folderDownloaded = "";


// TODO sessions[name] = ace.createEditSession("", lang);

//Toolbar
$("#runButton").click(function(){
    if(folderDownloaded==""){
        //download current folder
        changedFiles.forEach(function(file){
            termPost({
                action: "download",
                path: "/src/"+file,
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
        debug = true;
        $("#terminalFrame").hide("slow", "swing", function(){
            $("#editor").css("height", "100%").css("height", "-=84px");
        });
    }else{
        $("#debug").css("display", "none");
        $("#editor").css("width", "100%");
        clearMarker(lineMarker);
        lineMarker = -1;
        debug = false;
        $("#editor").css("height", "65%");
        $("#terminalFrame").show("slow", "swing",);
    }
}

function exitDebugger(){
    if($("#editor").hasClass("debugview")) {
        toggleDebug();
    }
    $("#stackTableBody").empty();
    $("#variableTableBody").empty();
}

var debug = false;
var breakpointAnchors = [];
var breakpointList = [];
var lineMarker = -1;
$("#debugButton").click(function () {
    toggleDebug();

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

function bindEditorBreakpoints(){
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
}

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
        case "updateDebugger":
            updateStack(event.data.stack);
            updateLocals(event.data.locals);
            break;
        case "exitDebugger":
            exitDebugger();
            break;
    }
});


function updateStack(stack){
    var stackArr = stack.trim().split("\r\n  ");
    clearMarker(lineMarker);
    try{
        var lineNum = parseInt(stackArr[0].match(/^\[\d\]\s[\w]+\.[\w]+\s\([\w]+\.[\w]+:([\d]+)\)$/m)[1]);
        lineMarker = setCurrentDebugLine(lineNum);
    }catch(err){
        console.log("Debugger Finished.");
    }
    $("#stackTableBody").empty();
    stackArr.forEach(function(element){
        var elementArr = element.split(" ");
        $("#stackTableBody").append("<tr><td>"+elementArr[0]+"</td><td>"+elementArr[1]+"</td><td>"+elementArr[2]+"</td></tr>");
    });
}

function updateLocals(locals){
    var localsArr = locals.trim().split("\r\n");
    localsArr.splice(0, 1);
    localsArr.splice(localsArr.indexOf("Local variables:"), 1);
    $("#variableTableBody").empty();
    localsArr.forEach(function(element){
        var elementArr = element.split(" = ");
        $("#variableTableBody").append("<tr><td>"+elementArr[0]+"</td><td>"+elementArr[1]+"</td></tr>");
    });
}

//Container Management
window.onbeforeunload = function(){
    termPost({
        action: "exitTerminal"
    });
    return undefined;
}

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