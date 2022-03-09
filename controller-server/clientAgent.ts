import { controlPanelClientDic, dancerClientDic, Dic } from "./types";
import { ControlPanelSocket } from "./test_websocket/controlPanelSocket";

class ClientList {
  clientList: dancerClientDic | controlPanelClientDic;
  constructor() {
    this.clientList = {};
  }

  addClient = (name: string, socket: any) => {
    // dancerSocket is of type DancerSocket
    this.clientList[name] = socket;
  };
  deleteClient = (name: string) => {
    delete this.clientList[name];
  };
  getClients = () => {
    return this.clientList;
  };
  getClientsIP = () => {
    const clientsIP: Dic = {};
    Object.keys(this.clientList).forEach((name) => {
      const ip = this.clientList[name].getClientIp();
      clientsIP[name] = ip;
    });
    console.log("ips: ", clientsIP);
    return clientsIP;
  };
}

export class ClientAgent {
  dancerClients: ClientList;
  controlPanelClients: ClientList;

  constructor() {
    this.controlPanelClients = new ClientList();
    this.dancerClients = new ClientList();
  }

  /**
   * handle all message received from webSocket, and emit to other sockets
   * Ex. message from RPi's webSocket => emit message to controlPanel's websocket
   * Ex. message from ControlPanel's webSocket => emit to RPi (performance) or emit to other controlPanel (multi editing)
   * @param {string} from - from who
   * @param {{ type, task, payload }} msg
   */
  socketReceiveData = (from: string, msg: any) => {
    // msg type need to be specified later
    const { type, task, payload } = msg;
    switch (type) {
      case "dancer": {
        Object.values(this.controlPanelClients.getClients()).forEach(
          (controlPanel: ControlPanelSocket) => {
            //   TODO: modify the argument data format to meet the data type SocketMes
            //   controlPanel.sendDataToClientControlPanel([
            //     task,
            //     {
            //       from,
            //       response: payload,
            //     },
            //   ]);
          }
        );
        break;
      }
      case "controlPanel": {
        break;
      }
      default:
        break;
    }

    console.log(
      "dancerClients: ",
      Object.keys(this.dancerClients.getClients())
    );
    console.log(
      "controlPanelClients: ",
      Object.keys(this.controlPanelClients.getClients())
    );
  };
}
