/* eslint-disable class-methods-use-this */
import {
  setPlay,
  setStop,
  startPlay,
  // fetchBoardConfig,
  updateDancerStatus,
} from "../slices/commandSlice";
import store from "../store";

class EditorSocketAPI {
  constructor() {
    this.ws = null;
    this.url = `ws://${window.location.host}`;
  }

  // async fetch() {
  //   await store.dispatch(fetchBoardConfig());
  // }

  init() {
    this.ws = new WebSocket(this.url);
    if (this.ws.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        this.init();
      }, 3000);
      return;
    }
    this.ws.onopen = async () => {
      console.log("Websocket for Editor Connected");

      this.sendDataToServer([
        "boardInfo",
        {
          type: "editor",
          name: location.hostname, // get hostname or something else
        },
      ]);

      this.ws.onerror = (err) => {
        console.log(`Editor's Websocket error : ${err.message} `);
      };

      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log(`Data from server :`, data);
        this.handleMessage(data);
      };

      this.ws.onclose = (e) => {
        console.log(`Websocket for Editor closed`);
      };
    };
  }

  sendDataToServer(data) {
    this.ws.send(JSON.stringify(data));
  }

  handleMessage(data) {
    const [task, payload] = data;

    switch (task) {
      case "getIp": {
        const { dancerClients } = payload;

        console.log(dancerClients);

        Object.keys(dancerClients).forEach((dancerName) => {
          store.dispatch(
            updateDancerStatus({
              dancerName,
              newStatus: {
                OK: true,
                isConnected: true,
                msg: "Connect Success",
                ip: dancerClients[dancerName].clientIp,
              },
            })
          );
        });
        break;
      }
      case "disconnect": {
        const {
          from,
          response: { OK, msg },
        } = payload;
        store.dispatch(
          updateDancerStatus({
            dancerName: from,
            newStatus: {
              OK,
              msg,
              isConnected: false,
            },
          })
        );
        break;
      }
      // case "play": {
      //   const {
      //     from,
      //     response: { OK, msg },
      //   } = payload;
      //   if (from === location.hostname) {
      //     const { sysTime } = msg;
      //     const realDelay = Math.max(sysTime - Date.now(), 0);
      //     console.log(`play control editor, ${sysTime}, delay:${realDelay}`);
      //     // store.dispatch(startPlay(msg));
      //     setTimeout(() => this.waveSurferApp.playPause(), realDelay);
      //   } else {
      //     store.dispatch(
      //       updateDancerStatus({
      //         dancerName: from,
      //         newStatus: {
      //           OK,
      //           msg,
      //         },
      //       })
      //     );
      //   }
      //   break;
      // }
      // case "pause": {
      //   const {
      //     from,
      //     response: { OK, msg },
      //   } = payload;
      //   if (from === location.hostname) {
      //     console.log("pause control editor");
      //     // store.dispatch(setPlay(false));
      //   } else {
      //     store.dispatch(
      //       updateDancerStatus({
      //         dancerName: from,
      //         newStatus: {
      //           OK,
      //           msg,
      //         },
      //       })
      //     );
      //   }
      //   break;
      // }
      // case "stop": {
      //   const {
      //     from,
      //     response: { OK, msg },
      //   } = payload;
      //   if (from === location.hostname) {
      //     console.log("stop control editor");
      //     // store.dispatch(setStop(true));
      //     this.waveSurferApp.stop();
      //   } else {
      //     store.dispatch(
      //       updateDancerStatus({
      //         dancerName: from,
      //         newStatus: {
      //           OK,
      //           msg,
      //         },
      //       })
      //     );
      //   }
      //   break;
      // }
      default:
        const {
          from,
          response: { OK, msg },
        } = payload;
        store.dispatch(
          updateDancerStatus({
            dancerName: from,
            newStatus: {
              OK,
              msg,
            },
          })
        );
        break;
    }
  }
}

export default EditorSocketAPI;
