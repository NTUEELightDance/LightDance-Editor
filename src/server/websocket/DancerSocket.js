class DancerSocket {
    constructor(ws, dancerName, dancerAgent) {
        this.ws = null;
        this.clientIp = null;
        this.dancerName = dancerName;
        this.dancerAgent = dancerAgent;
        this.init(ws);
    }
    init = (ws) => {
        this.ws = ws;
        this.dancerAgent.addDancerClient(this.dancerName, this);
    };
    handleMessage = () => {
        this.ws.onmessage = (message) => {
            const [task, payload] = JSON.parse(message.data);
            console.log(`${this.dancerName} response: `, task, "\nPayload: ", payload);

            this.dancerAgent.socketReceiveData(this.dancerName, {
                task: task,
                payload: payload,
                type: "dancer"
            })
        };
    };
    handleDisconnect = () => {
        this.ws.onclose = (mes) => {
            this.dancerAgent.deleteDancerClient(this.dancerName, this);
        }
    }
    sendDataToRpiSocket = (data) => {
        if (this.ws !== null) this.ws.send(JSON.stringify(data));
    };
    getClientIp = () => {
        if (this.ws !== null) {
            console.log(this.ws._socket.remoteAddress);
            this.clientIp = this.ws._socket.remoteAddress;
        }
    };
    //below are functions for editor server to use
    start = () => {
        this.sendDataToRpiSocket(["start"]);
    };
    play = (startTime = 0, whenToPlay = 0) => {
        this.sendDataToRpiSocket([
            "play",
            {
                startTime: startTime,
                whenToPlay: whenToPlay,
            },
        ]);
    };
    pause = () => {
        this.sendDataToRpiSocket(["pause"]);
    };
    stop = () => {
        this.sendDataToRpiSocket(["stop"]);
    };
    load = () => {
        this.sendDataToRpiSocket(["load"]);
    };
    terminate = () => {
        this.sendDataToRpiSocket(["terminate"]);
    };
    kick = () => {
        this.sendDataToRpiSocket(["kick"]);
    };
    uploadControl = (controlFile) => {
        //needs to be json file
        this.sendDataToRpiSocket(["uploadControl", controlFile]);
    };
    uploadLED = (LEDPic) => {
        this.sendDataToRpiSocket(["uploadLED", LEDPic]);
    };
    shutDown = () => {
        this.sendDataToRpiSocket(["shutDown"]);
    };
    reboot = () => {
        this.sendDataToRpiSocket(["reboot"]);
    };
    lightCurrentStatus = (currentStatus) => {
        this.sendDataToRpiSocket(["lightCurrentStatus", currentStatus]);
    };
    getBoardInfo = () => {
        this.sendDataToRpiSocket(["boardInfo"]);
    }
}

module.exports = DancerSocket;