import { WebSocket } from "ws";
import { CommandType } from "../constants";
import { PlayTimeType, MesC2S, MesS2C } from "../types";
import { ClientAgent } from "../clientAgent";
import { v4 as uuidv4 } from "uuid";

export class ControlPanelSocket {
  ws: any;
  controlPanelName: string;
  clientAgent: ClientAgent;
  methods: {
    [index: string]: Function;
  };
  constructor(ws: WebSocket, clientAgent: ClientAgent) {
    this.ws = null;
    this.controlPanelName = uuidv4();
    this.clientAgent = clientAgent;

    this.init(ws);

    this.methods = {
      [CommandType.PAUSE]: this.pause,
      [CommandType.PLAY]: this.play,
      [CommandType.STOP]: this.stop,
    };
  }

  init = (ws: WebSocket) => {
    this.ws = ws;
    this.clientAgent.controlPanelClients.addClient(this.controlPanelName, this);
  };
  handleMessage = () => {
    this.ws.onmessage = (message: any) => {
      const parsedData: MesC2S = JSON.parse(message.data);
      const { command, selectedDancers, payload } = parsedData;
      console.log(
        `${this.controlPanelName} response : ${command}\nPayload: ${payload}`
      );

      const dancers = this.clientAgent.dancerClients.getClients();
      selectedDancers.forEach((dancerName) => {
        dancers[dancerName].methods[command](payload);
      });
      this.ws.send(command);

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

  sendDataToClientControlPanel = (data: MesS2C) => {
    if (this.ws) this.ws.send(JSON.stringify(data));
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
