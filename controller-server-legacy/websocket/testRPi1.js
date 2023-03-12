const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8082");

socket.addEventListener("open", evnt => {
    console.log("Client RPi 1 websocket open on port ws://localhost:8082");
    socket.send(JSON.stringify({
        "command": "boardInfo",
        "status": 0,
        "payload": 
        {
            "type":  "RPi",
            "info": {
                "macaddr" : "1C:4D:70:0A:60:40",
            }
        }
    }));
});


socket.addEventListener("message", evnt => {
    console.log("RPi 1 received msg from server:", evnt.data);
});