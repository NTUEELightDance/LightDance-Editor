import { CommandType } from "../constants";
import led from "../../files/data/led.json";
import WebSocket from "ws";
import { Dic, LightStatusType, MesR2S, MesS2R, PlayTimeType } from "../types";
import { ClientAgent } from "../clientAgent";
import downloadControlJson from "../downloadControl";

class DancerSocket {
  ws: any;
  clientIp: string;
  dancerName: string;
  clientAgent: ClientAgent;
  methods: {
    [index: string]: Function;
  };
  constructor(ws: WebSocket, dancerName: string, clientAgent: ClientAgent) {
    this.ws = null;
    this.clientIp = "";
    this.clientAgent = clientAgent;
    this.dancerName = dancerName;
    this.init(ws);
    this.getClientIp();
    this.handleMessage();

    this.methods = {
      [CommandType.SYNC]: this.sync,
      [CommandType.KICK]: this.kick,
      [CommandType.LIGTHCURRENTSTATUS]: this.lightCurrentStatus,
      [CommandType.LOAD]: this.load,
      [CommandType.PAUSE]: this.pause,
      [CommandType.PLAY]: this.play,
      [CommandType.REBOOT]: this.reboot,
      [CommandType.SHUTDOWN]: this.shutDown,
      [CommandType.STOP]: this.stop,
      [CommandType.UPLOAD_CONTROL]: this.uploadControl,
      [CommandType.UPLOAD_LED]: this.uploadLED,
    };
  }

  init = (ws: WebSocket) => {
    this.ws = ws;
    this.clientAgent.dancerClients.addClient(this.dancerName, this);
  };
  handleMessage = () => {
    this.ws.onmessage = (message: any) => {
      const parsedData: MesR2S = JSON.parse(message.data);
      const { command, payload } = parsedData;
      console.log(
        `${this.dancerName} response: ${command}\nPayload: ${payload}`
      );
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
  sendDataToRpiSocket = (data: MesS2R) => {
    if (this.ws) this.ws.send(JSON.stringify(data));
  };
  getClientIp = () => {
    if (this.ws) {
      console.log(`${this.dancerName} Ip: ${this.ws._socket.remoteAddress}`);
      this.clientIp = this.ws._socket.remoteAddress;
      return this.clientIp
    }
  };
  // Below are functions for manager to use
  sync = () => {
    console.log(CommandType.SYNC);
    this.sendDataToRpiSocket({ command: CommandType.SYNC });
  };
  kick = () => {
    this.sendDataToRpiSocket({ command: CommandType.KICK });
  };
  lightCurrentStatus = (lightCurrentStatus: LightStatusType) => {
    this.sendDataToRpiSocket({
      command: CommandType.LIGTHCURRENTSTATUS /* ,payload: light object*/,
    });
  };
  load = () => {
    this.sendDataToRpiSocket({ command: CommandType.LOAD });
  };
  pause = () => {
    this.sendDataToRpiSocket({ command: CommandType.PAUSE });
  };
  play = (time: PlayTimeType = { startTime: 0, delay: 0, sysTime: 0 }) => {
    console.log(`[Debug] play: sysTime=${time.sysTime}`);
    this.sendDataToRpiSocket({ command: CommandType.PLAY, payload: time });
  };
  reboot = () => {
    this.sendDataToRpiSocket({ command: CommandType.REBOOT });
  };
  shutDown = () => {
    this.sendDataToRpiSocket({ command: CommandType.SHUTDOWN });
  };
  stop = () => {
    this.sendDataToRpiSocket({ command: CommandType.STOP });
  };

  uploadControl = async () => {
    const controlJSON = await downloadControlJson();
    console.log(controlJSON)
    // TODO: controlJSON parse

    this.sendDataToRpiSocket({
      command: CommandType.UPLOAD_CONTROL /* payload: ControlType*/,
    });
  };
  uploadLED = () => {
    // TODO
  };
}

export default DancerSocket;
