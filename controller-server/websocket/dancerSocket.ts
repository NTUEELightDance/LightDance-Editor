import { ActionType, CommandSubType } from "../constants";
import WebSocket from "ws";
import {
  ClientType,
  SingleDancerControlType,
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
import { OfJsonDB } from "../database/dancerOF";
import { ControlJsonDB } from "../database/dancerControlJson";
import { convertTypeAcquisitionFromJson } from "typescript";
import { LedJsonDB, LedJsonType } from "../database/dancerLED";
import { getDancerFiberData } from "../api/getDancerFiberData";
import { getDancerLEDData } from "../api/getDancerLEDData";

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
    dancerName = "",
    hostName = "",
    clientAgent: ClientAgent,
    ip = ""
  ) {
    this.ws = null;
    this.clientIP = "";
    this.clientAgent = clientAgent;
    this.dancerName = dancerName;
    this.hostName = hostName;
    this.init(ws);
    this.clientIP = ip;

    this.methods = {
      [ActionType.SYNC]: this.sync,
      [CommandSubType.KICK]: this.kick,
      [CommandSubType.LIGTHCURRENTSTATUS]: this.lightCurrentStatus,
      [CommandSubType.LOAD]: this.load,
      [CommandSubType.PAUSE]: this.pause,
      [CommandSubType.PLAY]: this.play,
      [CommandSubType.REBOOT]: this.reboot,
      [CommandSubType.SHUTDOWN]: this.shutDown,
      [CommandSubType.STOP]: this.stop,
      [ActionType.UPLOAD_OF]: this.uploadOf,
      [ActionType.UPLOAD_LED]: this.uploadLED,
      [ActionType.REFRESH]: this.refresh,
      [CommandSubType.RED]: this.red,
      [CommandSubType.BLUE]: this.blue,
      [CommandSubType.GREEN]: this.green,
      [CommandSubType.STMINIT]: this.stmInit,
      [CommandSubType.DARKALL]: this.darkAll,
      [CommandSubType.RESTARTCONTROLLER]: this.restartController,
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
      const parsedData: MesR2S = JSON.parse(message.data);
      const { command, payload } = parsedData;
      console.log(
        `[Message] ${this.dancerName} response: ${command} \n[Message] Payload: `,
        payload,
        "\n"
      );

      // to emit message to control panel, we add from in payload
      const mesToControlPanel: MesS2C = {
        ...parsedData,
        payload: { from: this.dancerName, success: parsedData["status"], ...parsedData["payload"] },
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
        command: ActionType.DISCONNECT,
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
  sendDataToRpiSocket = (data: MesS2R | any[]) => {
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
    this.sendDataToRpiSocket({ action: ActionType.SYNC });
  };
  kick = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.KICK],
    });
  };
  lightCurrentStatus = (lightCurrentStatus: LightStatusType) => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.LIGTHCURRENTSTATUS], /* ,payload: light object*/
    });
  };
  load = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.LOAD],
    });
  };
  pause = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.PAUSE],
    });
  };
  play = (time: PlayTimeType = { startTime: 0, delay: 0, sysTime: 0 }) => {
    console.log(`[Debug] play: sysTime=${time.sysTime} startTime=${time.startTime}`);
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: ["playerctl", "play", "0"] // we sent start time in milliseconds
    });
  };
  reboot = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.REBOOT],
    });
  };
  shutDown = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.SHUTDOWN],
    });
  };
  stop = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.STOP]
    });
  };

  uploadOf = (data: {[key: string]: SingleDancerControlType[]}) => {
    OfJsonDB[this.dancerName] = data[this.dancerName];
    this.sendDataToRpiSocket({
      action: ActionType.UPLOAD /* payload: ControlType*/,
      payload: [ControlJsonDB[this.dancerName], OfJsonDB[this.dancerName], LedJsonDB[this.dancerName]],
    });
    // console.log("OfJsonDB")
    // console.log(OfJsonDB)
  };
  uploadLED = (data: {[key: string]: LedJsonType}) => {
    // LedJsonDB[this.dancerName] = data[this.dancerName];
    this.sendDataToRpiSocket({
      action: ActionType.UPLOAD /* payload: ControlType*/,
      payload: [ControlJsonDB[this.dancerName], OfJsonDB[this.dancerName], LedJsonDB[this.dancerName]],
    });
  };

  // Refresh command is upload command in Rpi
  refresh = async () => {
    const { success: Ofsuccess, data: OfJson } = await getDancerFiberData(this.dancerName);
    const { success: LEDsuccess, data: LEDJson } = await getDancerLEDData(this.dancerName);
    if(Ofsuccess && LEDsuccess){
      OfJsonDB[this.dancerName] = OfJson;
      LedJsonDB[this.dancerName] = LEDJson;
      this.sendDataToRpiSocket({
        action: ActionType.UPLOAD /* payload: ControlType*/,
        payload: [ControlJsonDB[this.dancerName], OfJsonDB[this.dancerName], LedJsonDB[this.dancerName]],
      });
    } else {
      if(!Ofsuccess) console.log(`[Warning] ${this.dancerName} Of data is NOT UPDATED in refresh command.`);
      if(!LEDsuccess) console.log(`[Warning] ${this.dancerName} LED data is NOT UPDATED in refresh command.`);
    }
  };
  red = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.RED],
    });
  };
  blue = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.BLUE]
    });
  };
  green = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.GREEN]
    });
  };
  stmInit = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.STMINIT]
    });
  };
  darkAll = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.DARKALL]
    });
  };
  restartController = () => {
    this.sendDataToRpiSocket({
      action: ActionType.COMMAND,
      payload: [CommandSubType.RESTARTCONTROLLER]
    });
  };
}

export default DancerSocket;
