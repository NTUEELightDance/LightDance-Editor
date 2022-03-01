import COMMANDS from "../constants";
import { PlayTimeType, SocketMes } from "./index";

class ControlPanelSocket {
    ws;
    controlPanelName: string;
    controlPanelAgent: object;
    methods: {
        [index: string]: Function;
    };
    constructor(ws, controlPanelName, controlPanelAgent) {
        this.ws = null;
        this.controlPanelName = controlPanelName;
        this.controlPanelAgent = controlPanelAgent;
    }

    init = (ws: WebSocket) => {
        this.ws = ws;
        // this.editorAgent.addEditorClient(this.editorName, this);
    };
    handleMessage = () => {
        this.ws.onmessage = (message: any) => {
            const { task, payload } = JSON.parse(message.data);
            console.log(`${this.controlPanelName} response : ${task}\nPayload: ${payload}`);

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
