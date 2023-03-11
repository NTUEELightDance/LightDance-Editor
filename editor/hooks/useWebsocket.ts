import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { COMMANDS } from "@/constants";
// states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// Api
import { generateControlOF, generateControlLed } from "../core/utils/genJson";
// Types
import {
  SyncType,
  ServerMessage,
  ClientMessage,
  BoardInfoS2CType,
  BoardInfoC2SType,
  setMessageType,
  DancerStatusType,
  panelPayloadType,
} from "types/hooks/webSocket";

import { notification, log } from "core/utils";

const BOARDINFO = "boardInfo";
const DISCONNECT = "disconnect";
const url = `${location.origin}/controller-server-websocket`.replace(
  "http",
  "ws"
);

export default function useWebsocketState() {
  // states
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const [dancerStatus, setDancerStatus] = useImmer<DancerStatusType>({});
  const [delay, setDelay] = useImmer(0);
  const ws = useRef<WebSocket | null>(null);
  const sendDataToServer = (data: BoardInfoC2SType | ClientMessage) => {
    (ws.current as WebSocket).send(JSON.stringify(data));
  };

  const initWebSocket = () => {
    ws.current = new WebSocket(url);
    if (ws.current.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        initWebSocket();
      }, 3000);
      return;
    }
    ws.current.onopen = async () => {
      log("Websocket for Editor Connected");
      sendDataToServer({
        command: BOARDINFO,
        payload: { type: "controlPanel" },
      });
      (ws.current as WebSocket).onerror = (err) => {
        log(`Editor's Websocket error : ${err} `);
      };

      (ws.current as WebSocket).onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        handleMessage(data);
      };

      (ws.current as WebSocket).onclose = () => {
        log("Websocket for Editor closed");
      };
    };
  };

  const setDancerMsg = (payload: setMessageType) => {
    // payload : {array of dancerNames}
    const { dancer, msg, Ok = true, isConnected = true } = payload;
    setDancerStatus((draft) => {
      draft[dancer] = {
        ...draft[dancer],
        msg,
        Ok,
        isConnected,
      };
    });
  };

  const sendCommand = async (panelPayload: panelPayloadType) => {
    const { command, selectedDancers, delay } = panelPayload;
    selectedDancers.forEach((dancer) => {
      setDancerMsg({ dancer, msg: "......", Ok: false });
    });
    const sysTime = delay + Date.now();
    const MesC2S: ClientMessage = { command, selectedDancers };
    switch (
      command // handle command that needs payload
    ) {
      case COMMANDS.UPLOAD_LED:
        MesC2S.payload = await generateControlLed();
        break;
      case COMMANDS.UPLOAD_OF:
        MesC2S.payload = await generateControlOF();
        break;
      case COMMANDS.PLAY:
        MesC2S.payload = {
          // not using 'useReactiveVar' to prevent unecessary re-render
          startTime: reactiveState.currentTime(),
          delay,
          sysTime,
        };
        break;
      case COMMANDS.LIGTHCURRENTSTATUS:
        MesC2S.payload = {};
        break;
      case COMMANDS.NTHU_PLAY:
        await handleNTHUPlay(Date.now() + delay);
        return;
      case COMMANDS.NTHU_STOP:
        await handleNTHUStop();
        return;
      default:
        break;
    }
    sendDataToServer(MesC2S);
  };

  const handleNTHUPlay = async (sysTime: number) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    } as RequestInit;
    log(Date.now());

    fetch(`/api/nthu_play?sys_time=${sysTime}`, requestOptions)
      .then(async (response) => await response.text())
      .then((result) => {
        notification.success(result);
      })
      .catch((error) => {
        notification.error(error);
      });
  };

  const handleNTHUStop = async () => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    } as RequestInit;
    log(Date.now());

    fetch("/api/nthu_stop", requestOptions)
      .then(async (response) => await response.text())
      .then((result) => {
        notification.success(result);
      })
      .catch((error) => {
        notification.error(error);
      });
  };

  const handleMessage = (data: ServerMessage) => {
    const { command, payload } = data;
    const { success, info, from } = payload;
    switch (command) {
      case BOARDINFO: {
        const { dancerName, ip, hostName } = info as BoardInfoS2CType;
        setDancerStatus((draft) => {
          dancerName.map((name: string, index: number) => {
            draft[name] = {
              Ok: true,
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
        const { delay, offset } = info as SyncType;
        setDancerMsg({
          dancer: from,
          msg: `offset:${offset} , delay:${delay}`,
          Ok: success,
        });
        break;
      }
      case DISCONNECT: {
        setDancerMsg({
          isConnected: false,
          Ok: success,
          msg: info,
          dancer: from,
        });
        break;
      }
      default:
        setDancerMsg({
          Ok: success,
          msg: info.message,
          dancer: from,
        });
        break;
    }
  };

  useEffect(() => {
    const initDancerStatus: DancerStatusType = {};
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dancerNames]);

  return {
    delay,
    dancerStatus,
    sendCommand,
    setDelay,
  };
}
