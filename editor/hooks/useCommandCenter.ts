import { useEffect, useMemo, useState } from "react";

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
  FromControlPanelWebShell,
  FromControlPanelCloseGPIO,
  FromControlPanelRed,
  FromControlPanelGreen,
  FromControlPanelBlue,
  FromControlPanelYellow,
  FromControlPanelMagenta,
  FromControlPanelCyan,
  FromControlPanelDarkAll,
} from "@controller-server/types/controlPanelMessage";
import { notification } from "@/core/utils";
import useInterval from "./useInterval";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import { pushShellHistory, setRPiStatus } from "@/core/actions";

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
  | Omit<FromControlPanelWebShell, "from" | "statusCode">
  | Omit<FromControlPanelCloseGPIO, "from" | "statusCode">
  | Omit<FromControlPanelRed, "from" | "statusCode">
  | Omit<FromControlPanelGreen, "from" | "statusCode">
  | Omit<FromControlPanelBlue, "from" | "statusCode">
  | Omit<FromControlPanelYellow, "from" | "statusCode">
  | Omit<FromControlPanelMagenta, "from" | "statusCode">
  | Omit<FromControlPanelCyan, "from" | "statusCode">
  | Omit<FromControlPanelDarkAll, "from" | "statusCode">;

let websocket: WebSocket = initWebsocket({});

export default function useCommandCenter() {
  const [connected, setConnected] = useState(false);
  const RPiStatus = useReactiveVar(reactiveState.RPiStatus);
  const shellHistory = useReactiveVar(reactiveState.shellHistory);

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
            setRPiStatus({
              payload: (draft) => {
                Object.values(data.payload).forEach(
                  ({
                    IP,
                    MAC,
                    connected,
                    dancer,
                    interface: networkInterface,
                  }) => {
                    draft[dancer] ??= {
                      ethernet: {
                        name: dancer,
                        IP,
                        MAC,
                        connected: false,
                        message: "",
                        statusCode: 0,
                      },
                      wifi: {
                        name: dancer,
                        IP,
                        MAC,
                        connected: false,
                        message: "",
                        statusCode: 0,
                      },
                    };

                    if (networkInterface === "ethernet") {
                      draft[dancer].ethernet = {
                        name: dancer,
                        IP,
                        MAC,
                        connected,
                        message: "",
                        statusCode: 0,
                      };
                    }

                    if (networkInterface === "wifi") {
                      draft[dancer].wifi = {
                        name: dancer,
                        IP,
                        MAC,
                        connected,
                        message: "",
                        statusCode: 0,
                      };
                    }
                  }
                );
              },
              options: {
                refreshThreeSimulator: false,
                refreshWavesurfer: false,
              },
            });
            break;

          case "command":
            setRPiStatus({
              payload: (draft) => {
                const { command, dancer, message } = data.payload;
                draft[dancer] ??= {
                  ethernet: {
                    name: dancer,
                    IP: "",
                    MAC: "",
                    connected: false,
                    message: "",
                    statusCode: 0,
                  },
                  wifi: {
                    name: dancer,
                    IP: "",
                    MAC: "",
                    connected: false,
                    message: "",
                    statusCode: 0,
                  },
                };

                if (draft[dancer].ethernet.connected) {
                  draft[dancer].ethernet.message = `[${command}] ${message}`;
                  draft[dancer].ethernet.statusCode = data.statusCode;
                } else if (draft[dancer].wifi.connected) {
                  draft[dancer].wifi.message = `[${command}] ${message}`;
                  draft[dancer].wifi.statusCode = data.statusCode;
                }
              },
            });
            pushShellHistory({
              payload: {
                dancer: data.payload.dancer,
                command: data.payload.command,
                output: data.payload.message,
              },
              options: {
                refreshThreeSimulator: false,
                refreshWavesurfer: false,
              },
            });
            break;

          default:
            data satisfies never;
            break;
        }
      },
    }),
    []
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

  return { connected, send, reconnect, RPiStatus, shellHistory };
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
