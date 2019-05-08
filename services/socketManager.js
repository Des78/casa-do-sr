// Socket management layer access

// class references
const ws = require('express-ws');
const util = require('../services/utilities');   

//global private vars (don't need WeakMap due to singleton instance)
var userSockets = [];


class SocketManager {
    constructor () {
        if (!SocketManager.instance) {
            SocketManager.instance = this;
        }

        
        return SocketManager.instance;
    }

    // initializes the app web sockets
    init(app) {

        // init express app
        ws(app);

        // set client connection route handler
        app.ws("/", onConnect);
    }


    // Sends message data to all sockets associated with a user
    publish(userKey, eventName, eventData) {
        let event = {eventName: eventName, eventData: eventData};
        let userSock = userSockets.find(u => u.userKey === userKey);
        if (userSock) {
            userSock.sockets.forEach(socket => {
                socket.send(JSON.stringify(event));
            });
        }
    }

}

const socketManager = new SocketManager();
Object.freeze(socketManager);

module.exports = socketManager;


// private event handlers
function onConnect(socket, req, x) {
    const userKey = util.getParam(req, "key");

    // add an ID to the socket object for correlation
    socket.id = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);

    console.log("client socket connected: " + userKey + "-" + socket.id);

    let userSock = userSockets.find(u => u.userKey === userKey);
    if (!userSock) {
        // new user structure
        userSock = {
            userKey: userKey,
            sockets: []
        };
        userSockets.push(userSock);
    }
    userSock.sockets.push(socket);

    // subscribe disconnection
    socket.on('close', onDisconnect);

    // subscribe messages from client
    socket.on('message', onMessage);      
}


function onDisconnect() {

    // the closed socket is set on the "this" var
    let userSock = userSockets.find(u => u.sockets.find(s => s === this));
    if (userSock) {
        console.log("client socket disconnect: " + userSock.userKey + "-" + this.id);
        userSock.sockets = userSock.sockets.filter(u => u !== this);
    }
    else {
        console.log("client socket not found: " + this.id);
    }
}


function onMessage(msg) {

    console.log("client socket message recieved??: " + msg);
}
