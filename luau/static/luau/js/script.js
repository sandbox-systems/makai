let updateView;

/*
        <span className="row" ng-if="chat.from.uname === user.uname">
            <div className="col-xl-5"></div>
            <div className="col-xl-7">
                <div ng-mouseleave="setChildEditMenuDisplay($event, 'hidden')">
                    <div className="chatBubble ownChatBubble"
                         ng-mouseover="setChildEditMenuDisplay($event, 'visible')">
                        {{chat.message}}
                    </div>
                    <div className="btn-group-vertical ownChatEditMenu ownChatEditMenuFadeOut">
                        <button className="btn btn-light ownChatEditMenuBtn">
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-light ownChatEditMenuBtn"
                                ng-click="setChatToDeleteIndex($index)"
                                data-toggle="modal" data-target="#deleteChatModal">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-100">
                <span className="ownTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
            </div>
        </span>
        <span className="row" ng-if="chat.from.uname !== user.uname">
            <div className="col-xl-1">
                <img className="chatProfilePic" ng-src="{{chat.from.profilepic}}"/>
            </div>
            <div className="col-xl-6">
                <div>
                    <div className="chatBubble otherChatBubble">
                        {{chat.message}}
                    </div>
                </div>
            </div>
            <div className="col-xl-5"></div>
            <div className="w-100">
                <span className="otherTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
            </div>
        </span>
 */

class ChatMsg extends React.Component {
    render() {
        let bubble;
        if (this.props.from === this.props.aid) {
            bubble = (
                <span className="row">
                    <div className="col-xl-5"/>
                    <div className="col-xl-7">
                        <div>
                            <div className="chatBubble ownChatBubble">
                                {this.props.msg}
                            </div>
                        </div>
                    </div>
                </span>
            );
            /*
                        <div ng-mouseleave="setChildEditMenuDisplay($event, 'hidden')">
                            <div className="chatBubble ownChatBubble"
                                 ng-mouseover="setChildEditMenuDisplay($event, 'visible')">
                                {this.props.msg}
                            </div>
                            <div className="btn-group-vertical ownChatEditMenu ownChatEditMenuFadeOut">
                                <button className="btn btn-light ownChatEditMenuBtn">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-light ownChatEditMenuBtn"
                                        ng-click="setChatToDeleteIndex($index)"
                                        data-toggle="modal" data-target="#deleteChatModal">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                    <div className="w-100">
                        <span className="ownTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
                    </div>
            */
        } else {
            bubble = (
                <span className="row">
                    <div className="col-xl-1">
                        <img className="chatProfilePic" src={userPool[this.props.from].profilepic}/>
                    </div>
                    <div className="col-xl-6">
                        <div>
                            <div className="chatBubble otherChatBubble">
                                {this.props.msg}
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5"/>
                </span>
            );
            /*
                    <div className="w-100">
                        <span className="otherTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
                    </div>
            */
        }
        return (
             <div className="chatMsg">
                 {bubble}
             </div>
        )
    }
}

class Luau extends React.Component {
    constructor() {
        super();
        this.state = {
            rooms: {
                "ETslpNysEB4R39WSGAFb": {
                    chatEntries: []
                }
            },
            friends: [],
            authUser: {}
        };
        updateView = (varName, data, key) => this.updateState(varName, data, key);
    }

    updateState(varName, data, key) {
        let newState = this.state;
        if (key)
            newState[varName][key] = data;
        else
            newState[varName] = data;
        this.setState(newState);
        console.log(this.state);
    }

    render() {
        return (
            <div className="row">
                <div id="groupsBG" className="fixed-top w-25 fullH"/>
                <div id="groups" className="col-3 fullH container-fluid noPadding">
                    <div id="selfInfo">
                        <img id="selfInfoImg" src={this.state.authUser.photoURL}/>
                        <br/><br/>
                        <strong>{this.state.authUser.displayName}</strong>
                        <br/>
                        {this.state.authUser.email}
                    </div>
                    <div id="searchBox" className="input-group">
                        <input id="searchBoxInput" type="text" className="form-control" placeholder="Search..."
                               aria-label="searchbox" aria-describedby="searchbox" ng-model="searchBoxQuery"/>
                        <div className="input-group-append">
                            <button id="searchBoxBtn" className="btn btn-outline-light" type="button"
                                    data-toggle="modal"
                                    data-target="#createGroupModal">
                                <span className="fas fa-plus"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="chat"
                     className="col-9 fullH container-fluid"> {/*Hide if no chat room selected (hidden class vs '')*/}
                    <div id="chatLog">
                        {Object.keys(this.state.rooms["ETslpNysEB4R39WSGAFb"].chatEntries).map(key => {
                            let entry = this.state.rooms["ETslpNysEB4R39WSGAFb"].chatEntries[key];
                            return (<ChatMsg key={entry.id} from={entry.from} msg={entry.message} aid={this.state.authUser.uid}/>)
                        })}
                    </div>
                </div>
                <div id="chatOverlay" className="col-9 fullH"> {/*Show if no chat room selected ('' vs hidden class)*/}
                    <div id="noRoomSelectedTxt">
                        Select a group to start chatting
                    </div>
                </div>
            </div>
        )
    }
}

/*
    <span ng-if="chat.type === 'message'">
    </span>
    <span ng-if="chat.type !== 'message'">
        <span className="row" ng-if="chat.from.uname === user.uname">
            <div className="col-xl-5"></div>
            <div className="col-xl-7">
                <div ng-mouseleave="setChildEditMenuDisplay($event, 'hidden')">
                    <div className="chatBubble ownChatBubble"
                         ng-mouseover="setChildEditMenuDisplay($event, 'visible')">
                        <img className="chatImg" ng-if="chat.type.includes('image')"
                             ng-src="{{chat.url}}">
                        <div ng-if="!chat.type.includes('image')">
                            <button className="ownChatFile btn" type="submit"
                                    ng-click="chat.download()">
                                <span className="ownChatFileIcon"><span className="fas"
                                                                        ng-class="isCodeFile(chat.name) ? 'fa-file-code' : 'fa-file'"></span></span>&nbsp;
                                {{chat.name}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span className="ownChatFileDownload"><span
                                    className="fas fa-download"></span></span>
                            </button>
                        </div>
                    </div>
                    <div className="btn-group-vertical ownChatEditMenu">
                        <button className="btn btn-light ownChatEditMenuBtn">
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-light ownChatEditMenuBtn">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-100">
                <span className="ownTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
            </div>
        </span>
        <span className="row" ng-if="chat.from.uname !== user.uname">
            <div className="col-xl-1">
                <img className="chatProfilePic" ng-src="{{chat.from.profilepic}}"/>
            </div>
            <div className="col-xl-6">
                <div>
                    <div className="chatBubble otherChatBubble">
                        <img className="chatImg" ng-if="chat.type.includes('image')"
                             ng-src="{{chat.url}}">
                        <div ng-if="!chat.type.includes('image')">
                            <button className="otherChatFile btn" type="submit"
                                    ng-click="chat.download()">
                                <span className="otherChatFileIcon"><span className="fas"
                                                                          ng-class="isCodeFile(chat.name) ? 'fa-file-code' : 'fa-file'"></span></span>&nbsp;
                                {{chat.name}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span className="otherChatFileDownload"><span
                                    className="fas fa-download"></span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-xl-5"></div>
            <div className="w-100">
                <span className="otherTimestamp">{{getLocalTimeNow(chat.timestamp)}}</span>
            </div>
        </span>
    </span>
 */