import { useEffect, useContext } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";
import { useImmer } from "use-immer";
import { COMMANDS } from "constants";
// states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
export default function useWebsocketState() {
  //states
  const url = `${location.origin}/controller-server-websocket`.replace(
    "http",
    "ws"
  );
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const time = useReactiveVar(reactiveState.currentTime);
  //websocket context
  const webSocket = useContext(WebSocketContext);
  const [dancerStatus, setDancerStatus] = useImmer({});
  const [ws, setWs] = useImmer(null);
  useEffect(() => {
    const initDancerStatus = {};
    ws = new WebSocket(url);
    if (ws.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        init();
      }, 3000);
      return;
    }
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

    // onmessage
    websocket.onmessage = (msg) => {
      handleMessage();
    };
  }, []);
  const init = () => {
    setWs(new WebSocket(url));
    if (ws.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        init();
      }, 3000);
      return;
    }
  };
  const handleMessage = () => {};

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
      // case COMMANDS.UPLOAD_LED:
      //   MesC2S[payload] = {};
      //   break;
      // case COMMANDS.UPLOAD_CONTROL:
      //   MesC2S[payload] = {};
      //   break;
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
    webSocket.sendDataToServer(MesC2S, setDancerStatus);
  };
  return {
    dancerStatus,
    setDancerStatus,
    sendCommand,
  };
}
