import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { COMMANDS, WEBSOCKETCLIENT } from "constants";
// states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
const url = `${location.origin}/controller-server-websocket`.replace(
  "http",
  "ws"
);
export default function useWebsocketState() {
  //states
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const time = useReactiveVar(reactiveState.currentTime);
  const [dancerStatus, setDancerStatus] = useImmer({});
  const [delay, setDelay] = useImmer(0);
  const ws = useRef(null);
  const initWebSocket = () => {
    ws.current = new WebSocket(url);
    if (ws.current.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        initWebSocket();
      }, 3000);
      return;
    }
    ws.current.onopen = async () => {
      console.log("Websocket for Editor Connected");
      sendDataToServer({
        command: COMMANDS.BOARDINFO,
        payload: { type: WEBSOCKETCLIENT.CONTROLPANEL },
      });

      ws.current.onerror = (err) => {
        console.log(`Editor's Websocket error : ${err.message} `);
      };

      ws.current.onmessage = (msg) => {
        console.log(msg);
        const data = JSON.parse(msg.data);
        console.log(`Data from server :`, data);
        handleMessage(data);
      };

      ws.current.onclose = (e) => {
        console.log(`Websocket for Editor closed`);
      };
    };
  };
  const sendDataToServer = (data) => {
    ws.current.send(JSON.stringify(data));
  };
  const clearDancerStatusMsg = (payload) => {
    // payload : {array of dancerNames}
    const selectedDancers = payload;
    setDancerStatus((draft) => {
      selectedDancers.forEach((dancer) => {
        draft[dancer].msg = "";
      });
    });
  };
  const sendCommand = async (panelPayload) => {
    const { command, selectedDancers, delay } = panelPayload;
    clearDancerStatusMsg(selectedDancers);
    let MesC2S = { command, selectedDancers, payload: "" };
    switch (
      command //handle command that needs payload
    ) {
      case COMMANDS.UPLOAD_LED:
        MesC2S.payload = {};
        break;
      case COMMANDS.UPLOAD_CONTROL:
        MesC2S.payload = {};
        break;
      case COMMANDS.TEST:
        MesC2S.payload = {};
        break;
      case COMMANDS.PLAY:
        const de = delay !== "" ? parseInt(delay, 10) : 0;
        const sysTime = de + Date.now();
        MesC2S.payload = {
          startTime: time,
          delay,
          sysTime,
        };
        break;
      case COMMANDS.LIGTHCURRENTSTATUS:
        MesC2S.payload = {};
        break;
    }
    ws.current.send(JSON.stringify(MesC2S));
  };
  const handleMessage = (data) => {
    const { command, payload } = data;
    const { success, info, from } = payload;
    switch (command) {
      case COMMANDS.BOARDINFO: {
        const { dancerName, ip, hostName } = info;
        console.log("");
        if (!success) {
          console.error("websocket response error");
          break;
        }
        setDancerStatus((draft) => {
          Object.keys(dancerName).forEach((Name, index) => {
            draft[Name] = {
              OK: true,
              isConnected: true,
              msg: "Connect Success",
              ip: ip[index],
              hostname: hostName[index],
            };
          });
        });
        break;
      }
      case COMMANDS.SYNC: {
        const { delay, offset } = info;
        setDelay(delay);
        setDancerStatus((draft) => {
          draft[from].msg = offset;
        });
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
        break;
    }
  };
  useEffect(() => {
    const initDancerStatus = {};
    initWebSocket();
    dancerNames.forEach((dancerName) => {
      const initStatus = {
        hostname: "-",
        ip: "-",
        OK: false,
        msg: "",
        isConnected: false,
      };
      initDancerStatus[dancerName] = initStatus;
    });
    setDancerStatus(initDancerStatus);
  }, []);
  return {
    delay,
    dancerStatus,
    sendCommand,
  };
}
