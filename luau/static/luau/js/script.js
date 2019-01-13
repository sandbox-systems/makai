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

class RoomBtn extends React.Component {
    render() {
        return (
            <button className="btn roomBtn">
                {/*ng-click="chatRoom.changeRoom(chatRoom.getSelRoomIndex() === rooms.indexOf(room) ? -1 : rooms.indexOf(room))"
                    ng-class="chatRoom.getSelRoomIndex() === $index ? 'selectedRoomBtn' : ''"*/}
                <span className="row">
                <span className="col-3">
                    <img
                        className="groupInfoImg"/> {/*ng-if="room.members.length === 1" ng-src="{{room.members[0].profilepic}}"*/}
                    <img width="64" height="64" src="img/group.png"/> {/*ng-if="room.members.length !== 1"*/}
                </span>&nbsp;
                    <span className="col-5">
                    <span className="groupText">
                        <strong>{this.props.name}</strong>
                        <br/>
                        <span className="groupTextSub">
                            {/*{{formatGroupTextSub(room.chats)}}*/}
                        </span>
                    </span>
                    </span>
                    <span className="col-3"> {/*ng-if="room.unread > 0"*/}
                        {/*<span*/}
                        {/*className="unreadCount badge badge-pill badge-danger float-right">{{room.unread}}</span>*/}
                    </span>
                </span>
            </button>
        )
    }
}

class RoomMemberBtn extends React.Component {
    render() {
        return (
            <div className="moreGroupInfoUser">
                <img className="groupInfoImg" src={this.props.profilepic}/>
                &nbsp;{this.props.name}<br/>
                <span className="removeGroupMember" data-toggle="modal" data-target="#removeFromGroupModal"
                      title="Kick from group"> {/* ng-click="setModalMember(member)"*/}
                    <span className="fas fa-door-open"/>
                </span>&nbsp;
                {/* ng-if="!chatClient.hasFriend(member)" ng-click="chatClient.sendFriendRequest(member)"*/}
                <span className="addFriendBtn" title="Add friend">
                    <span className="fas fa-user-plus"/>
                </span>&nbsp;
                {/* ng-if="chatClient.hasFriend(member)" ng-click="setModalMember(member)"*/}
                <span className="removeFriendBtn" data-toggle="modal" data-target="#removeFriendModal"
                      title="Remove friend">
                        <span className="fas fa-user-minus"/>
                    </span>
                <br/><br/>
            </div>
        )
    }
}

class FriendBtn extends React.Component {
    render() {
        return (
            <div className="moreGroupInfoFriend">
                <span> {/* ng-if="!chatRoom.hasMember(friend)" */}
                    <img className="groupInfoImg" src={this.props.profilepic}/>
                    &nbsp;{this.props.name}<br/>
                    {/* ng-click="chatRoom.addFriendAsMember(friend)" */}
                    <span className="addGroupMember" title="Add to group">
                        <span className="fas fa-plus"/>
                    </span>&nbsp;
                    <span className="removeFriendBtn" data-toggle="modal" data-target="#removeFriendModal"
                          title="Remove friend"> {/* ng-click="chatClient.unfriend(friend)" */}
                        <span className="fas fa-user-minus"/>
                    </span>
                    <br/><br/>
                </span>
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
                    chatEntries: [],
                    members: []
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
        // Activate popups
        $('[data-toggle="popover"]').popover();
    }

    render() {
        return (
            <div>
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
                        {Object.keys(this.state.rooms).map(key => {
                            let room = this.state.rooms[key];
                            return (<RoomBtn key={key} name={room.name}/>)
                        })}
                    </div>
                    <div id="chat"
                         className="col-9 fullH container-fluid"> {/*Hide if no chat room selected (hidden class vs '')*/}
                        <div id="chatLog">
                            {Object.keys(this.state.rooms["ETslpNysEB4R39WSGAFb"].chatEntries).map(key => {
                                let entry = this.state.rooms["ETslpNysEB4R39WSGAFb"].chatEntries[key];
                                return (<ChatMsg key={entry.id} from={entry.from} msg={entry.message}
                                                 aid={this.state.authUser.uid}/>)
                            })}
                        </div>
                        <div id="chatInput" className="row container-fluid offset-3 fixed-bottom noPadding">
                            <div id="attachBtnOverlay" className="col-1 text-center">
                            <span id="attachBtn" data-toggle="modal" data-target="#attachModal">
                                <span className="fas fa-paperclip"/>
                            </span>
                            </div>
                            <div className="col-8">
                                <div id="chatInputBoxContainer">
                                    <textarea className="form-control" id="chatInputBox"
                                              placeholder="Write something..."
                                              rows="1"/>
                                    {/* ng-model="chatInputText" ng-change="chatClient.updateTypingStatus()"*/}
                                    <div id="chatInputBorder"/>
                                </div>
                                <input type="button" id="chatInputSubmitBtn"/>
                                {/* onClick="$('#chatInputBox').val('')"*/}
                                {/*ng-click="chatRoom.sendChat(chatInputText)" */}
                            </div>
                        </div>
                        <div id="groupInfo" className="navbar text-dark offset-3 w-75 fixed-top">
                            <span id="groupSignature" className="float-left">
                                <span className="navbar-brand">
                                    <span> {/* ng-if="chatRoom.getSelectedRoom().members.length === 1"*/}
                                        <img
                                            className="groupImg"/> {/*ng-src="{{chatRoom.getSelectedRoom().members[0].profilepic}}"*/}
                                    </span>
                                    <span
                                        className="rounded-circle nicePurpleBG text-light p-2">{/* ng-if="chatRoom.getSelectedRoom().members.length > 1"*/}
                                        <span className="fas fa-users"/>
                                    </span>
                                    &nbsp;
                                    <span id="groupName" data-toggle="modal"
                                          data-target="#renameGroupModal">{this.state.rooms["ETslpNysEB4R39WSGAFb"].name}</span>
                                    <sup id="editGroupData">
                                        <span className="fas fa-pencil-alt"/>
                                    </sup>
                                </span>
                            </span>
                            <span id="moreGroupInfoBtnContainer" className="float-right">
                                <span id="onlineMembersContainer">
                                    {this.state.rooms["ETslpNysEB4R39WSGAFb"].members.map(id => {
                                        if (id === this.state.authUser.uid)
                                            return "";
                                        return (
                                            <span> {/* ng-if="member.isOnline"*/}
                                                <img className="onlineMember bordered-circle-green groupInfoImg"
                                                     data-toggle="popover"
                                                     data-html="true"
                                                     data-content={"<strong>" + userPool[id].name + "</strong><br/>Something"}
                                                     data-placement="top"
                                                     src={userPool[id].profilepic}/>
                                                {/*<img ng-if="member.isTyping" className="onlineMemberTyping"*/}
                                                {/*src="img/typing.png"/>*/}
                                                &nbsp;
                                            </span>
                                        );
                                    })}
                                </span>
                                <span id="moreGroupInfoBtn" className="groupInfoItem hamburger hamburger--elastic">
                                    <span className="hamburger-box">
                                        CLICK
                                        <span className="hamburger-inner"/>
                                    </span>
                                </span>
                            </span>
                        </div>
                    </div>
                    <div id="chatOverlay"
                         className="col-9 fullH"> {/*Show if no chat room selected ('' vs hidden class)*/}
                        <div id="noRoomSelectedTxt">
                            Select a group to start chatting
                        </div>
                    </div>
                    {/* style="z-index: 1030; position: fixed"*/}
                    <div id="moreGroupInfo" className="fixed-top off-screen w-25 h-100"> {/* off-screen */}
                        <div id="closePanelContainer"/>
                        <div id="moreGroupInfoContainer">
                            <span id="leaveGroupBtn" data-toggle="modal" data-target="#leaveGroupModal"
                                  title="Leave Group">
                                <span className="fas fa-door-open"/>&nbsp;Leave group
                            </span>
                            <hr className="divider"/>
                            {this.state.rooms["ETslpNysEB4R39WSGAFb"].members.map(id => {
                                let member = userPool[id];
                                return (<RoomMemberBtn key={id} name={member.name} profilepic={member.profilepic}/>)
                            })}
                            <hr className="divider"/>
                            {this.state.friends.map(friend => {
                                return (<FriendBtn key={friend.id} name={friend.name} profilepic={friend.profilepic}/>)
                            })}
                        </div>
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