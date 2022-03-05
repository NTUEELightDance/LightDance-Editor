import { WebSocket } from "ws";
import COMMANDS from "../constants";
import { PlayTimeType, SocketMes, Dic } from "../types";
import downloadControlJson from "../downloadControl";

class ControlPanelSocket {
    ws: any;
    controlPanelName: string;
    controlPanelAgent: Dic;
    dancerAgent: Dic
    methods: {
        [index: string]: Function;
    };
    constructor(ws: WebSocket, controlPanelName: string, controlPanelAgent: Dic, dancerAgent: Dic) {
        this.ws = null;
        this.controlPanelName = controlPanelName;
        this.controlPanelAgent = controlPanelAgent;
        this.dancerAgent = dancerAgent
        this.init(ws)

        this.methods = {
            [COMMANDS.PAUSE]: this.pause,
            [COMMANDS.PLAY]: this.play,
            [COMMANDS.STOP]: this.stop,
        };
    }

    init = (ws: WebSocket) => {
        this.ws = ws;
        this.controlPanelAgent.addControlPanelClient(this.controlPanelName, this);
    };
    handleMessage = () => {
        this.ws.onmessage = (message: any) => {
            const { task, payload } = JSON.parse(message.data);
            console.log(`${this.controlPanelName} response : ${task}\nPayload: ${payload}`);


            // after getting boardInfo, editor can make commands with apis
            if (task === "controlPanelCommand") {
                let { command, args, selectedDancers } = payload;
                if (command === COMMANDS.UPLOAD_CONTROL) {
                    downloadControlJson().then((result) => (args = result));
                }
                const dancers = this.dancerAgent.getDancerClients()
                console.log(dancers)
                selectedDancers.forEach((dancerName: string) => {
                    dancers[dancerName].methods[command](args);
                });
                this.ws.send(command);
            }

            // this.controlPanelAgent.socketReceiveData(this.controlPanelName, {
            //     task: task,
            //     payload: payload,
            //     type: "editor",
            // });
        };
    };
    handleDisconnect = () => {
        this.ws.onclose = () => {
            // this.controlPanelAgent.deleteClient(this.controlPanelName);
        };
    };
    sendDataToClientControlPanel = (data: SocketMes) => {
        if (this.ws) this.ws.send(JSON.stringify);
    };
    play = (time: PlayTimeType = { startTime: 0, delay: 0, sysTime: 0 }) => {
        // TODO
    };
    pause = () => {
        // TODO
    };
    stop = () => {
        // TODO
    };
}

export default ControlPanelSocket;
