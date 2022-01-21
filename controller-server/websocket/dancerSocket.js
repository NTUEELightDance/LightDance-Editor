import COMMANDS from "../constants/index.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const led = require("../../data/led.json");

class DancerSocket {
  constructor(ws, dancerName, dancerAgent) {
    this.ws = null;
    this.clientIp = null;
    this.dancerName = dancerName;
    this.dancerAgent = dancerAgent;
    this.init(ws);
    this.getClientIp();
    this.handleDisconnect();

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

  init = (ws) => {
    this.ws = ws;
    this.dancerAgent.addDancerClient(this.dancerName, this);
  };
  handleMessage = () => {
    this.ws.onmessage = (message) => {
      const [task, payload] = JSON.parse(message.data);
      console.log(
        `${this.dancerName} response: `,
        task,
        "\nPayload: ",
        payload
      );

      this.dancerAgent.socketReceiveData(this.dancerName, {
        task: task,
        payload: payload,
        type: "dancer",
      });
    };
  };
  handleDisconnect = () => {
    this.ws.onclose = (mes) => {
      console.log(`${this.dancerName} disconnected!`);
      this.dancerAgent.socketReceiveData(this.dancerName, {
        task: "disconnect",
        payload: { msg: "Disconnected", OK: false },
        type: "dancer",
      });
      this.dancerAgent.deleteDancerClient(this.dancerName);
    };
  };
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
  sync = () => {
    console.log("sync");
    this.sendDataToRpiSocket(["sync"]);
  };
  start = () => {
    this.sendDataToRpiSocket(["start", this.dancerName]);
  };
  play = ({ startTime = 0, delay = 0, sysTime = 0 }) => {
    console.log(`[Debug] play: systime=${sysTime}`);
    this.sendDataToRpiSocket([
      "play",
      {
        startTime,
        delay,
        sysTime,
        // sysTime: delay + Date.now(),
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
  uploadControl = ({ controlJson }) => {
    //needs to be json file
    // if the status is same as last one => need to delete
    let dancerJson = controlJson.map(({ start, status, fade }) => ({
      start,
      fade,
      status: status[this.dancerName],
    }));

    // set fade false if status are the same
    for (let i = 0; i < dancerJson.length - 1; i++) {
      if (
        dancerJson[i].fade === true &&
        JSON.stringify(dancerJson[i].status) ===
          JSON.stringify(dancerJson[i + 1].status)
      ) {
        dancerJson[i].fade = false;
      }
    }

    // compress dancer JSON if adjacent frame are the same
    let compressedDancerJson = dancerJson.reduce(
      (acc, currentFrame) => {
        const lastFrame = acc[acc.length - 1];
        const lastFrameFade = lastFrame.fade;
        const lastFrameStatus = lastFrame.status;
        const currentFrameFade = currentFrame.fade;
        const currentFrameStatus = currentFrame.status;
        if (lastFrameFade !== currentFrameFade) {
          if (
            JSON.stringify(lastFrameStatus) ===
            JSON.stringify(currentFrameStatus)
          )
            return [...acc];
          return [...acc, currentFrame];
        } else if (
          JSON.stringify(lastFrameStatus) !== JSON.stringify(currentFrameStatus)
        ) {
          return [...acc, currentFrame];
        } else {
          return [...acc];
        }
      },
      [dancerJson[0]]
    );
    console.log("Upload size: ", compressedDancerJson.length);
    this.sendDataToRpiSocket(["uploadControl", compressedDancerJson]);
  };
  uploadLED = ({ ledData }) => {
    // TODO parse LED
    this.sendDataToRpiSocket(["uploadLED", led]);
  };
  shutDown = () => {
    this.sendDataToRpiSocket(["shutDown"]);
  };
  reboot = () => {
    this.sendDataToRpiSocket(["reboot"]);
  };
  lightCurrentStatus = ({ lightCurrentStatus }) => {
    this.sendDataToRpiSocket([
      "lightCurrentStatus",
      lightCurrentStatus[this.dancerName],
    ]);
  };
  getBoardInfo = () => {
    this.sendDataToRpiSocket(["boardInfo"]);
  };
}

export default DancerSocket;
