let updateView;

class Luau extends React.Component {
    constructor() {
        super();
        this.state = {
            rooms: [],
            friends: []
        };
        updateView = (varName, data) => this.updateState(varName, data);
    }

    updateState(varName, data) {
        console.log(data);
        let newState = this.state;
        newState[varName] = data;
        this.setState(newState);
    }

    render() {
        return (
            < div >
            {this.state.rooms.map(room => {
                return (
                    < h1 > {room.name
            }
                {
                    room.desc
                }
            <
                /h1>
            )
            })
    }
        {
            this.state.friends.map(friend => {
                return (
                    < h1 > {friend.name
            }<
                img
                src = {friend.profilepic
            }
                /></
                h1 >
            )
            })
        }
    <
        /div>
    )
    }
}

async function init() {
    initFirebase({
        apiKey: "{{ config.apiKey }}",
        authDomain: "{{ config.authDomain }}",
        databaseURL: "{{ config.databaseURL }}",
        projectId: "{{ config.projectId }}",
        storageBucket: "{{ config.storageBucket }}",
        messagingSenderId: "{{ config.messagingSenderId }}"
    });
    let authenticated = await initUser();

    if (!authenticated) {
        // User not signed in
    }

    await initLuau(updateView);
}

init();

ReactDOM.render( < Luau / >, $('#rooms').get(0)
)
;