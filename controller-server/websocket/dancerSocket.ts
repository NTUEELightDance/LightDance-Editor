import { CommandType } from "../constants";
import led from "../../files/data/led.json";
import WebSocket from "ws";
import {
  ClientType,
  ControlType,
  Dic,
  LedType,
  LightStatusType,
  MesR2S,
  MesS2C,
  MesS2R,
  PlayTimeType,
} from "../types";
import { ClientAgent } from "../clientAgent";

class DancerSocket {
  ws: any;
  clientIP: string;
  dancerName: string;
  clientAgent: ClientAgent;
  hostName: string;
  methods: {
    [index: string]: Function;
  };
  constructor(
    ws: WebSocket,
    dancerName: string = "",
    hostName: string = "",
    clientAgent: ClientAgent,
    ip: string = ""
  ) {
    this.ws = null;
    this.clientIP = "";
    this.clientAgent = clientAgent;
    this.dancerName = dancerName;
    this.hostName = hostName;
    this.init(ws);
    this.clientIP = ip;

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
      [CommandType.UPLOAD_OF]: this.uploadOf,
      [CommandType.UPLOAD_LED]: this.uploadLED,
      [CommandType.RED]: this.red,
      [CommandType.BLUE]: this.blue,
      [CommandType.GREEN]: this.green,
      [CommandType.STMINIT]: this.stmInit,
      [CommandType.DARKALL]: this.darkAll,
      [CommandType.RESTARTCONTROLLER]: this.restartController,
    };
  }

  init = (ws: WebSocket) => {
    this.ws = ws;
    this.clientAgent.dancerClients.addClient(this.dancerName, this);
    this.handleDisconnect();

    console.log("[Connect] DancerSocket established! id: ", this.dancerName);
    console.log(
      "[Connect] Current connected dancers: ",
      Object.keys(this.clientAgent.dancerClients.getClients()),
      "\n"
    );
  };
  handleMessage = () => {
    this.ws.onmessage = (message: any) => {
      let parsedData: MesR2S = JSON.parse(message.data);
      const { command, payload } = parsedData;
      console.log(
        `[Message] ${this.dancerName} response: ${command} \n[Message] Payload: `,
        payload,
        "\n"
      );

      // to emit message to control panel, we add from in payload
      const mesToControlPanel: MesS2C = {
        ...parsedData,
        payload: { from: this.dancerName, ...parsedData["payload"] },
      };
      this.clientAgent.socketReceiveData(
        this.dancerName,
        mesToControlPanel,
        ClientType.RPI
      );
    };
  };
  handleDisconnect = () => {
    this.ws.onclose = (message: any) => {
      console.log(`[Disconnect] dancer ${this.dancerName} disconnect!\n`);
      const disconnectResponse: MesS2C = {
        command: CommandType.DISCONNECT,
        payload: {
          from: this.dancerName,
          success: false,
          info: "dancer disconnect",
        },
      };
      this.clientAgent.socketReceiveData(
        this.dancerName,
        disconnectResponse,
        ClientType.RPI
      );
      this.clientAgent.dancerClients.deleteClient(this.dancerName);
    };
  };
  sendDataToRpiSocket = (data: MesS2R) => {
    if (this.ws) this.ws.send(JSON.stringify(data));
  };
  // getClientIp = () => {
  //   if (this.ws) {
  //     console.log(`${this.dancerName} Ip: ${this.ws._socket.remoteAddress}`);
  //     this.clientIp = this.ws._socket.remoteAddress;
  //     return this.clientIp;
  //   }
  // };
  // Below are functions for manager to use
  sync = () => {
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

  uploadOf = (data: ControlType) => {
    this.sendDataToRpiSocket({
      command: CommandType.UPLOAD_OF /* payload: ControlType*/,
      payload: data[this.dancerName],
    });
  };
  uploadLED = (data: LedType) => {
    this.sendDataToRpiSocket({
      command: CommandType.UPLOAD_LED /* payload: ControlType*/,
      payload: data[this.dancerName],
    });
  };
  red = () => {
    this.sendDataToRpiSocket({ command: CommandType.RED });
  };
  blue = () => {
    this.sendDataToRpiSocket({ command: CommandType.BLUE });
  };
  green = () => {
    this.sendDataToRpiSocket({ command: CommandType.GREEN });
  };
  stmInit = () => {
    this.sendDataToRpiSocket({ command: CommandType.STMINIT});
  };
  darkAll = () => {
    this.sendDataToRpiSocket({ command: CommandType.DARKALL });
  };
  restartController = () => {
    this.sendDataToRpiSocket({ command: CommandType.RESTARTCONTROLLER });
  };
}

export default DancerSocket;
