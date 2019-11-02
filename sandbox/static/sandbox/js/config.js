//ACE Editor
var editor;
var editorOptions = {
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
    useSoftTabs: true, // boolean: true if we want to use spaces than tabs
    tabSize: 4, // number
    wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
    indentedSoftWrap: true, // boolean
    foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.

    // code snippets
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
};

String.prototype.format = function () {
    let str = this;
    for (let i = 0; i < arguments.length; i++) {
        str = str.replace("{" + i + "}", arguments[i])
    }
    return str;
};

// Set up Firebase
firebase.initializeApp(config);
var firestore = firebase.firestore();
firestore.settings({
    timestampsInSnapshots: true
});
var realtime = firebase.database();
// var storage = firebase.storage();

var files = {
    // "file.txt": {
    //     id: 1,
    //     contents: "Hello world!"
    // },
    // "anotherfile.js": {
    //     id: 2,
    //     contents: "Another 2"
    // },
    // "folder2/boom.txt": {
    //     id: 3,
    //     contents: "7"
    // },
    // "folder1/nestedfile.html": {
    //     id: 4,
    //     contents: "Another 3"
    // },
    // "folder3/folder4/folder5/hello.txt": {
    //     id: 5,
    //     contents: "9"
    // },
    // "folder1/anothenested.txt": {
    //     id: 6,
    //     contents: "4"
    // },
    // "folder1/another/anotherone/another/verynested.txt": {
    //     id: 7,
    //     contents: "5"
    // },
    // "folder2/booms.txt": {
    //     id: 8,
    //     contents: "8"
    // },
    // "folder1/another/anotherone/hello.txt": {
    //     id: 9,
    //     contents: "6"
    // }
};

var csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// TODO put onAuthStateChanged and priv_user get events in functions to be able to await response

// T O D O When merging with chat, use global firebase initUser function
let uid = "";
let tokens = {};
let init = (async () => {
    await (() => {
        return new Promise(resolve => {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    uid = user.uid;
                    resolve();
                } else {
                    // TODO Handle no user is signed in
                }
            }); // TODO Handle error
        })
    })();

    // Fetch access tokens
    await (() => {
        return new Promise(resolve => {
            firestore.collection('priv_user').doc(uid).get()
                .then(doc => {
                    let data = doc.data();
                    Object.keys(data).forEach(key => {
                        let type = key.replace("_token", "");
                        tokens[type] = data[key];
                    });
                    resolve();
                })
                .catch(err => {
                    // TODO Handle error
                });
        })
    })();
});
