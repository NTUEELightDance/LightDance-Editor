import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { COMMANDS, WEBSOCKETCLIENT } from "constants";
// states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { breadcrumbsClasses } from "@mui/material";
const BOARDINFO = "boardInfo";
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
  const [lastCommand, setlastCommand] = useImmer("");
  const [lastSelectedDancer, setlastSelectedDancer] = useImmer([]);
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
        command: BOARDINFO,
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
  const setDancerMsg = (payload) => {
    // payload : {array of dancerNames}
    const { dancer, msg, Ok } = payload;
    setDancerStatus((draft) => {
      draft[dancer] = {
        ...draft[dancer],
        msg,
        Ok,
      };
    });
  };
  const sendCommand = async (panelPayload) => {
    const { command, selectedDancers, delay } = panelPayload;
    selectedDancers.forEach((dancer) => {
      setDancerMsg({ dancer, msg: "...", Ok: false });
    });
    setlastCommand(command);
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
      default:
        break;
    }
    sendDataToServer(MesC2S);
  };
  const handleMessage = (data) => {
    const { command, payload } = data;
    const { success, info, from } = payload;
    switch (command) {
      case BOARDINFO: {
        const { dancerName, ip, hostName } = info;
        setDancerStatus((draft) => {
          Object.keys(dancerName).forEach((name, index) => {
            draft[name] = {
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
        setDancerMsg({
          dancer: from,
          msg: `offset:${offset} , delay:${delay}`,
          Ok: success,
        });
        break;
      }
      default:
        setDancerMsg({
          Ok: success,
          msg: info,
          dancer: from,
        });
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
        Ok: false,
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
    setDelay,
  };
}
