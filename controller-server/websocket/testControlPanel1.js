const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:8082");

socket.addEventListener("open", (evnt)  => {
    console.log("Client ControPanel 1 websocket open on port ws://localhost:8082");
    socket.send(JSON.stringify({
        command: "boardInfo",
        payload: {
            type:  "controlPanel",
        }
    }));

    socket.send(JSON.stringify({
        command: "uploadOf",
        selectedDancers: ["Justin"],
        payload: [{
            "start": 0, // ms
            "fade": true,
            "status": {
                  "Calf_R": [255, 255, 255, 10], // r, g, b, a
              "Thigh_R": [255, 255, 255, 10],
              "LymphaticDuct_R": [255, 255, 255, 10],
              "Waist_R": [255, 255, 255, 10],
              "Arm_R": [255, 255, 255, 10],
              "Shoulder_R": [255, 255, 255, 10],
              "CollarBone_R": [255, 255, 255, 10],
              "Chest": [255, 255, 255, 10],
              "Visor": [255, 255, 255, 10],
              "Ear_R": [255, 255, 255, 10],
              "Calf_L": [255, 255, 255, 10],
              "Thigh_L": [255, 255, 255, 10],
              "LymphaticDuct_L": [255, 255, 255, 10],
              "Waist_L": [255, 255, 255, 10],
              "CollarBone_L": [255, 255, 255, 10],
              "Arm_L": [255, 255, 255, 10],
              "Ear_L": [255, 255, 255, 10],
              "Shoulder_L": [255, 255, 255, 10],
              "Glove_L": [255, 255, 255, 10],
              "Glove_R": [255, 255, 255, 10]
            }
          }]

        // uploadLED = (data: LedType) => {
        //      this.sendDataToRpiSocket({
        //           command: CommandType.UPLOAD_LED /* payload: ControlType*/,
        //           payload: data[this.dancerName],
        //         });
        //     };
    }));

    // socket.send(JSON.stringify({
    //     command: "stop",
    //     selectedDancers: ["Justin"],

    //     // play command:
    //     // payload: {
    //     //     startTime: 0, delay: 0, sysTime: 0 
    //     // }
    // }));
    


});


socket.addEventListener("message", evnt => {
    console.log("ControPanel 1 Received msg from server:", evnt.data);
});