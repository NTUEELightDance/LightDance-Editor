const COMMANDS = require("../../constant");

class EditorSocket {
  constructor(ws, editorName, editorAgent) {
    this.ws = null;
    this.editorName = editorName;
    this.editorAgent = editorAgent;
    this.init(ws);
    this.handleDisconnect();

    this.methods = {
      [COMMANDS.PAUSE]: this.pause,
      [COMMANDS.PLAY]: this.play,
      [COMMANDS.STOP]: this.stop,
    };
  }

  init = (ws) => {
    this.ws = ws;
    this.editorAgent.addEditorClient(this.editorName, this);
  };

  handleMessage = () => {
    this.ws.onmessage = (message) => {
      const [task, payload] = JSON.parse(message.data);
      console.log("Client response: ", task, "\nPayload: ", payload);

      // switch (task) {
      //   case "boardInfo": {

      //     return;
      //   }
      // }

      this.editorAgent.socketReceiveData(this.editorName, {
        task: task,
        payload: payload,
        type: "editor",
      });
    };
  };

  handleDisconnect = () => {
    this.ws.onclose = () => {
      this.editorAgent.deleteEditorClient(this.editorName);
    };
  };

  sendDataToClientEditor = (data) => {
    if (this.ws !== null) this.ws.send(JSON.stringify(data));
  };

  play = ({ startTime = 0, delay = 0 }) => {
    this.sendDataToClientEditor([
      "play",
      {
        startTime,
        delay,
        sysTime: delay + Date.now(),
      },
    ]);
  };
  pause = () => {
    this.sendDataToClientEditor(["pause"]);
  };
  stop = () => {
    this.sendDataToClientEditor(["stop"]);
  };
}

module.exports = EditorSocket;
