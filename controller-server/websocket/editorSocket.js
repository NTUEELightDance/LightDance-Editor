import downloadControlJson from "../downloadControl.js";
import COMMANDS from "../constants/index.js";

class EditorSocket {
  constructor(ws, editorName, editorAgent, dancerAgent) {
    this.ws = null;
    this.editorName = editorName;
    this.editorAgent = editorAgent;
    this.dancerAgent = dancerAgent;
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
      // after getting boardInfo, editor can make commands with apis
      if (task === "editorCommand") {
        let { command, args, selectedDancers } = payload;
        if (command === COMMANDS.UPLOAD_CONTROL) {
          downloadControlJson().then((result) => (args = result));
        }
        selectedDancers.forEach((dancerName) => {
          this.dancerAgent.getDancerClients[dancerName].methods[command](args);
        });
        this.ws.send(command);
      }

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
    console.log(`To Editor, play`);
    this.sendDataToClientEditor([
      "play",
      {
        from: this.editorName,
        response: {
          OK: true,
          msg: {
            startTime,
            delay,
            sysTime: delay + Date.now(),
          },
        },
      },
    ]);
  };
  pause = () => {
    console.log(`To Editor, pause`);
    this.sendDataToClientEditor([
      "pause",
      {
        from: this.editorName,
        response: {
          OK: true,
          msg: "call by editor",
        },
      },
    ]);
  };
  stop = () => {
    console.log(`To Editor, stop`);
    this.sendDataToClientEditor([
      "stop",
      {
        from: this.editorName,
        response: {
          OK: true,
          msg: "call by editor",
        },
      },
    ]);
  };
}

export default EditorSocket;
