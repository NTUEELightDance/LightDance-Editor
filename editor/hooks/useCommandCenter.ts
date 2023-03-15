import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";

import type {
  FromControlPanel as ToControllerServer,
  ToControlPanel as FromControllerServer,
  FromControlPanelBoardInfo,
  FromControlPanelPlay,
  FromControlPanelPause,
  FromControlPanelStop,
  FromControlPanelLoad,
  FromControlPanelUpload,
  FromControlPanelReboot,
  FromControlPanelTest,
  FromControlPanelRed,
  FromControlPanelGreen,
  FromControlPanelBlue,
  FromControlPanelDarkAll,
} from "@controller-server/types/controlPanelMessage";
import { notification } from "@/core/utils";
import useInterval from "./useInterval";

type WebsocketConfig = Partial<
  Pick<WebSocket, "onopen" | "onclose" | "onerror" | "onmessage">
>;

export type PartialControlPanelMessage =
  | Omit<FromControlPanelBoardInfo, "from" | "statusCode">
  | Omit<FromControlPanelPlay, "from" | "statusCode">
  | Omit<FromControlPanelPause, "from" | "statusCode">
  | Omit<FromControlPanelStop, "from" | "statusCode">
  | Omit<FromControlPanelLoad, "from" | "statusCode">
  | Omit<FromControlPanelUpload, "from" | "statusCode">
  | Omit<FromControlPanelReboot, "from" | "statusCode">
  | Omit<FromControlPanelTest, "from" | "statusCode">
  | Omit<FromControlPanelRed, "from" | "statusCode">
  | Omit<FromControlPanelGreen, "from" | "statusCode">
  | Omit<FromControlPanelBlue, "from" | "statusCode">
  | Omit<FromControlPanelDarkAll, "from" | "statusCode">;

export type RPiStatus = {
  [name: string]: {
    name: string;
    IP: string;
    MAC: string;
    connected: boolean;
    message: string;
    statusCode: number;
  };
};

let websocket: WebSocket = initWebsocket({});

export default function useCommandCenter() {
  const [connected, setConnected] = useState(false);
  const [RPiStatus, setRPiStatus] = useImmer<RPiStatus>({});

  const websocketConfig = useMemo<WebsocketConfig>(
    () => ({
      onopen: () => {
        setConnected(true);
        send({ topic: "boardInfo" });
      },
      onclose: () => {
        setConnected(false);
      },
      onerror: () => {
        setConnected(false);
      },
      onmessage: (event: MessageEvent) => {
        const data = JSON.parse(event.data) as FromControllerServer;

        switch (data.topic) {
          case "boardInfo":
            setRPiStatus((draft) => {
              Object.values(data.payload).forEach(
                ({ IP, MAC, connected, dancer }) => {
                  draft[dancer] ??= {
                    name: dancer,
                    IP,
                    MAC,
                    connected: false,
                    message: "",
                    statusCode: 0,
                  };

                  draft[dancer].IP = IP;
                  draft[dancer].MAC = MAC;
                  draft[dancer].connected = connected;
                }
              );
            });
            break;

          case "command":
            setRPiStatus((draft) => {
              const { command, dancer, message } = data.payload;
              draft[dancer] ??= {
                name: dancer,
                IP: "",
                MAC: "",
                connected: false,
                message: "",
                statusCode: 0,
              };

              draft[dancer].message = `[${command}] ${message}`;
              draft[dancer].statusCode = data.statusCode;
            });
            break;

          default:
            break;
        }
      },
    }),
    [setRPiStatus]
  );

  const reconnect = () => {
    websocket.close();
    websocket = initWebsocket(websocketConfig);
  };

  const send = (message: PartialControlPanelMessage) => {
    if (websocket.readyState !== WebSocket.OPEN) {
      setConnected(false);
      notification.error("websocket is not connected");
    }

    const payload: ToControllerServer = {
      from: "controlPanel",
      statusCode: 0,
      ...message,
    };

    notification.success(`sent command: ${payload.topic}`);

    websocket.send(JSON.stringify(payload));
  };

  useEffect(() => {
    configureWebsocket(websocket, websocketConfig);
    setConnected(websocket.readyState === WebSocket.OPEN);
  }, [websocketConfig]);

  useInterval(() => {
    if (websocket.readyState !== WebSocket.OPEN) {
      notification.info("reconnecting...");
      setConnected(false);
      reconnect();
    } else {
      setConnected(true);
    }
  }, 5000);

  return { connected, send, reconnect, RPiStatus };
}

function initWebsocket({
  onopen,
  onclose,
  onmessage,
  onerror,
}: WebsocketConfig) {
  const newWebsocket = new WebSocket(
    `${location.origin.replace(/^http/, "ws")}/controller-server-websocket`
  );

  if (onopen) newWebsocket.onopen = onopen;
  if (onclose) newWebsocket.onclose = onclose;
  if (onerror) newWebsocket.onerror = onerror;
  if (onmessage) newWebsocket.onmessage = onmessage;

  return newWebsocket;
}

function configureWebsocket(websocket: WebSocket, config: WebsocketConfig) {
  if (config.onopen) websocket.onopen = config.onopen;
  if (config.onclose) websocket.onclose = config.onclose;
  if (config.onerror) websocket.onerror = config.onerror;
  if (config.onmessage) websocket.onmessage = config.onmessage;
}
