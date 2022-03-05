import COMMANDS from "../constants";
import led from "../../files/data/led.json";
import WebSocket from 'ws';
import { Dic, LightStatusType, PlayTimeType, SocketMes } from "../types"

class DancerSocket {
    ws: any;
    clientIp: string;
    dancerName: string;
    dancerAgent: Dic; // TODO: Change to dancerAgent Interface
    methods: {
        [index: string]: Function;
    };
    constructor(ws: WebSocket, dancerName: string, dancerAgent: Dic) {
        this.ws = null;
        this.clientIp = "";
        this.dancerName = dancerName;
        this.dancerAgent = dancerAgent;
        this.init(ws);
        this.getClientIp();
        this.handleMessage();

        this.methods = {
            [COMMANDS.SYNC]: this.sync,
            [COMMANDS.KICK]: this.kick,
            [COMMANDS.LIGTHCURRENTSTATUS]: this.lightCurrentStatus,
            [COMMANDS.LOAD]: this.load,
            [COMMANDS.PAUSE]: this.pause,
            [COMMANDS.PLAY]: this.play,
            [COMMANDS.REBOOT]: this.reboot,
            [COMMANDS.SHUTDOWN]: this.shutDown,
            [COMMANDS.START]: this.start,
            [COMMANDS.STOP]: this.stop,
            [COMMANDS.TERMINATE]: this.terminate,
            [COMMANDS.UPLOAD_CONTROL]: this.uploadControl,
            [COMMANDS.UPLOAD_LED]: this.uploadLED,
        };
    }

    init = (ws: WebSocket) => {
        this.ws = ws;
        this.dancerAgent.addDancerClient(this.dancerName, this);
    };
    handleMessage = () => {
        this.ws.onmessage = (message: any) => {
            const { task, payload } = JSON.parse(message.data);
            console.log(`${this.dancerName} response: ${task}\nPayload: ${payload}`);
            // this.dancerAgent.socketRecieveData(this.dancerName, {});
        };
    };
    handleDisconnect = () => {
        this.ws.onclose = (message: any) => {
            console.log(`${this.dancerName} disconnected!`);
            // this.dancerAgent.socketReceiveData(this.dancerName, {});
            // this.dancerAgent.deleteDancerClient(this.dancerName);
        };
    };
    sendDataToRpiSocket = (data: SocketMes) => {
        if (this.ws) this.ws.send(JSON.stringify(data));
    };
    getClientIp = () => {
        if (this.ws) {
            console.log(`${this.dancerName} Ip: ${this.ws._socket.remoteAddress}`);
            this.clientIp = this.ws._socket.remoteAddress;
        }
    };
    // Below are functions for manager to use
    sync = () => {
        console.log(COMMANDS.SYNC);
        this.sendDataToRpiSocket({ command: COMMANDS.SYNC });
    };
    kick = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.KICK });
    };
    lightCurrentStatus = (lightCurrentStatus: LightStatusType) => {
        this.sendDataToRpiSocket({ command: COMMANDS.LIGTHCURRENTSTATUS /* ,payload: light object*/ });
    };
    load = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.LOAD });
    };
    pause = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.PAUSE });
    };
    play = (time: PlayTimeType = { startTime: 0, delay: 0, sysTime: 0 }) => {
        console.log(`[Debug] play: sysTime=${time.sysTime}`);
        this.sendDataToRpiSocket({ command: COMMANDS.PLAY, payload: time });
    };
    reboot = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.REBOOT });
    };
    shutDown = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.SHUTDOWN });
    };
    start = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.START, payload: this.dancerName });
    };
    stop = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.STOP });
    };
    terminate = () => {
        this.sendDataToRpiSocket({ command: COMMANDS.TERMINATE });
    };
    uploadControl = () => {
        // TODO
    };
    uploadLED = () => {
        // TODO
    };
}

export default DancerSocket;
