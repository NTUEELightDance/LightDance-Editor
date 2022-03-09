import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";
import { useImmer } from "use-immer";

export default function useWebsocketState() {
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const { webSocket } = useContext(WebSocketContext);
  const [dancerStatus, setDancerStatus] = useImmer({});
  useEffect(() => {
    // setDancerStatus()
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
  const clearDancerStatusMsg = async (payload) => {
    //payload : array of dancerNames
    // const { dancerNames } = payload;
    // setDancerStatus((prevStatus) => {
    //   dancerNames.forEach((name) => {
    //     prevStatus.name.msg = "";
    //   });
    // });
  };
  return {
    dancerStatus,
    clearDancerStatusMsg,
  };
}
