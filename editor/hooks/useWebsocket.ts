import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";
import { useImmer } from "use-immer";

export default function useWebsocketState() {
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const { ws, sendDataToServer } = useContext(WebSocketContext);
  const [dancerStatus, setDancerStatus] = useImmer({});
  useEffect(() => {
    const initDancerStatus = {};
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
  const clearDancerStatusMsg = (payload) => {
    // payload : {array of dancerNames}
    const { selectedDancers } = payload;
    setDancerStatus((draft) => {
      selectedDancers.forEach((dancer) => {
        draft[dancer].msg = "";
      });
    });
  };
  const commandSocket = async (MesC2S) => {
    sendDataToServer(MesC2S);
  };
  return {
    dancerStatus,
    clearDancerStatusMsg,
    commandSocket,
  };
}
