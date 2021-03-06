class EditorSocket {
  constructor(ws, editorName, editorAgent) {
    this.ws = null;
    this.editorName = editorName;
    this.editorAgent = editorAgent;
    this.init(ws);
  }

  init(ws) {
    this.ws = ws;
  }

  handleMessage() {
    this.ws.onmessage = (message) => {
      const [task, payload] = JSON.parse(message.data);
      console.log("Client response: ", task, "\nPayload: ", payload);

      switch (task) {
        case "boardInfo": {
          this.editorAgent.addEditorClient(this.editorName, this);
          return;
        }
      }

      this.editorAgent.socketRecieveData(this.editorName, {
        task: task,
        payload: payload,
        type: "Editor",
      });
    };
  }

  handleDisconnect() {
    this.ws.onclose = () => {
      this.editorAgent.deleteEditorClient(this.editorName);
    };
  }

  sendDataToClientEditor(data) {
    if (this.ws !== null) this.ws.send(JSON.stringify(data));
  }
}

module.exports = EditorSocket;
