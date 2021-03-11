const COMMANDS = require("../../constant");

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
      this.dancerAgent.socketReceiveData(this.dancerName, {
        task: "disconnect",
        payload: { msg: "Diconnected", OK: false },
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
  sync = () => {};
  start = () => {
    this.sendDataToRpiSocket(["start", this.dancerName]);
  };
  play = ({ startTime = 0, delay = 0 }) => {
    const currentTime = new Date();
    this.sendDataToRpiSocket([
      "play",
      {
        startTime: startTime,
        whenToPlay: delay + currentTime.getTime(),
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
    // TODO: if the status is same as last one => need to delete
    const dancerJson = controlJson.map(({ start, status, fade }) => ({
      start,
      fade,
      status: status[this.dancerName],
    }));
    this.sendDataToRpiSocket(["uploadControl", dancerJson]);
  };
  uploadLED = ({ ledData }) => {
    this.sendDataToRpiSocket(["uploadLED", ledData]);
  };
  shutDown = () => {
    this.sendDataToRpiSocket(["shutDown"]);
  };
  reboot = () => {
    this.sendDataToRpiSocket(["reboot"]);
  };
  lightCurrentStatus = ({ lightCurrentStatus }) => {
    this.sendDataToRpiSocket(["lightCurrentStatus", lightCurrentStatus]);
  };
  getBoardInfo = () => {
    this.sendDataToRpiSocket(["boardInfo"]);
  };
}

module.exports = DancerSocket;
