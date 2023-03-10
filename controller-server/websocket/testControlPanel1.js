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
        command: "refresh",
        selectedDancers: ["1_hank"],
    }));

    socket.send(JSON.stringify({
        command: "uploadOf",
        selectedDancers: ["1_hank"],
        payload: {"1_hank" :  [ 
            {
            "start": 0,
            "fade": true,
            "status": {
                "of1": [255, 255, 255, 10],
                "of2": [255, 255, 255, 10],
                "of3": [255, 255, 255, 10],
                "of4": [255, 255, 255, 10],
                "of5": [255, 255, 255, 10],
                "of6": [255, 255, 255, 10],
                "of7": [255, 255, 255, 10],
                "of8": [255, 255, 255, 10],
                "of9": [255, 255, 255, 10],
                "of10": [255, 255, 255, 10],
                "of11": [255, 255, 255, 10],
                "of12": [255, 255, 255, 10],
                "of13": [255, 255, 255, 10],
                "of14": [255, 255, 255, 10],
                "of15": [255, 255, 255, 10],
                "of16": [255, 255, 255, 10],
                "of17": [255, 255, 255, 10],
                "of18": [255, 255, 255, 10],
                "of19": [255, 255, 255, 10],
                "of20": [255, 255, 255, 10]
            }
            },
            {
            "start": 10000,
            "fade": true,
            "status": {
                "of1": [255, 255, 255, 0],
                "of2": [255, 255, 255, 0],
                "of3": [255, 255, 255, 0],
                "of4": [255, 255, 255, 0],
                "of5": [255, 255, 255, 0],
                "of6": [255, 255, 255, 0],
                "of7": [255, 255, 255, 0],
                "of8": [255, 255, 255, 0],
                "of9": [255, 255, 255, 0],
                "of10": [255, 255, 255, 0],
                "of11": [255, 255, 255, 0],
                "of12": [255, 255, 255, 0],
                "of13": [255, 255, 255, 0],
                "of14": [255, 255, 255, 0],
                "of15": [255, 255, 255, 0],
                "of16": [255, 255, 255, 0],
                "of17": [255, 255, 255, 0],
                "of18": [255, 255, 255, 0],
                "of19": [255, 255, 255, 0],
                "of20": [255, 255, 255, 0]
            }
            }
            ]
        }

        // uploadLED = (data: LedType) => {
        //      this.sendDataToRpiSocket({
        //           command: ActionType.UPLOAD_LED /* payload: ControlType*/,
        //           payload: data[this.dancerName],
        //         });
        //     };
    }));

    const UPLOAD_LED_JSON = {
        "1_hank": {
            "led1": [
            {
                "start": 150,
                "fade": true,
                "status": [
                    [40, 0, 0, 10],
                    [40, 0, 0, 10],
                    [40, 0, 0, 10],
                    [40, 0, 0, 10]
                ]
            },
            {
                "start": 300,
                "fade": false,
                "status": [
                    [0, 40, 0, 10],
                    [0, 40, 0, 10],
                    [0, 40, 0, 10],
                    [0, 40, 0, 10]
                ]
            }
            ],
            "led2": [
            {
                "start": 0,
                "fade": true,
                "status": [
                [0, 0, 40, 10],
                [0, 0, 40, 10],
                [0, 0, 40, 10],
                [0, 0, 40, 10]
                ]
            },
            {
                "start": 300,
                "fade": false,
                "status": [
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10]
                ]
            }
            ],
            "led3": [
            {
                "start": 0,
                "fade": true,
                "status": [
                [40, 40, 40, 10],
                [40, 40, 40, 10],
                [40, 40, 40, 10],
                [40, 40, 40, 10]
                ]
            },
            {
                "start": 60,
                "fade": false,
                "status": [
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10]
                ]
            },
            {
                "start": 120,
                "fade": false,
                "status": [
                [40, 40, 40, 10],
                [40, 40, 40, 10],
                [40, 40, 40, 10],
                [40, 40, 40, 10]
                ]
            },
            {
                "start": 180,
                "fade": false,
                "status": [
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10],
                [0, 0, 0, 10]
                ]
            }
        ]
        }
    }

    socket.send(JSON.stringify({
        command: "uploadLed",
        selectedDancers: ["1_hank"],
        payload: UPLOAD_LED_JSON
    }))

    // socket.send(JSON.stringify({
    //     command: "stop",
    //     selectedDancers: ["1_hank"],

    //     // play command:
    //     // payload: {
    //     //     startTime: 0, delay: 0, sysTime: 0 
    //     // }
    // }));

    // socket.send(JSON.stringify({
    //     command: "play",
    //     selectedDancers: ["1_hank"],

    //     // play command:
    //     payload: {
    //         startTime: 20, delay: 0, sysTime: 0 
    //     }
    // }));

});


socket.addEventListener("message", evnt => {
    console.log("ControPanel 1 Received msg from server:", evnt.data);
});