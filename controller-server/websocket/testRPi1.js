const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8082");

socket.addEventListener("open", evnt => {
    console.log("Client RPi 1 websocket open on port ws://localhost:8082");
    socket.send(JSON.stringify({
        command: "boardInfo",
        payload: {
            type:  "RPi",
            info: {
                dancerName: "Justin",
                ip: "127.0.0",
                hostName: "light-dance",
            }
        }
    }));
});


socket.addEventListener("message", evnt => {
    console.log("RPi 1 received msg from server:", evnt.data);
});