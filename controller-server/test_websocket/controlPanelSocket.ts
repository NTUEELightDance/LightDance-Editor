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
    this.handleDisconnect();

    console.log(
      "[Connect] ControlPanelSocket established! id: ",
      this.controlPanelName
    );
    console.log(
      "[Connect] Current connected controlPanels: ",
      Object.keys(this.clientAgent.controlPanelClients.getClients()),
      "\n"
    );
  };
  handleMessage = () => {
    this.ws.onmessage = (message: any) => {
      const parsedData: MesC2S = JSON.parse(message.data);
      const { command, selectedDancers, payload } = parsedData;
      console.log(
        `[Message] From ${this.controlPanelName} receive command: ${command}\n[Message] Payload: ${payload}\n`
      );

      const dancers = this.clientAgent.dancerClients.getClients();
      selectedDancers.forEach((dancerName) => {
        try {
          dancers[dancerName].methods[command](payload);
        } catch (e) {
          console.log(`[Error] From ${this.controlPanelName} error: ${e}\n`);
          const res: MesS2C = {
            command,
            payload: {
              success: false,
              info: "error",
            },
          };
          this.ws.send(JSON.stringify(res));
        }
      });

      // this.controlPanelAgent.socketReceiveData(this.controlPanelName, {
      //     task: task,
      //     payload: payload,
      //     type: "editor",
      // });
    };
  };
  handleDisconnect = () => {
    this.ws.onclose = () => {
      this.clientAgent.controlPanelClients.deleteClient(this.controlPanelName);
      console.log(
        `[Disconnect] controlPanel ${this.controlPanelName} disconnect!\n`
      );
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
