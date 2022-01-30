import React, { useLayoutEffect, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// states and actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { setSelectedDancers, toggleSelectedDancer } from "../../core/actions";
import { selectLoad } from "../../slices/loadSlice";
// controller instance
import controller from "./Controller";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

/**
 * This is Display component
 * @component
 */
const Simulator: React.FC = ({}) => {
  useLayoutEffect(() => {
    controller.init();
    const currentStatus = reactiveState.currentStatus();
    const currentPos = reactiveState.currentPos();
    controller.updateDancersStatus(currentStatus);
    controller.updateDancersPos(currentPos);
  }, []);

  const isPlaying = useReactiveVar(reactiveState.isPlaying);
  useEffect(() => {
    if (isPlaying) {
      controller.play();
    } else {
      controller.stop();
    }
  }, [isPlaying]);

  // hotkeys
  const hotKeyRef = useHotkeys("ctrl+a, cmd+a", (e) => {
    e.preventDefault();
    console.log("press ctrl + a on simulator");
    const { dancerNames } = useSelector(selectLoad);
    setSelectedDancers({ payload: dancerNames });
  });

  return (
    <div
      ref={hotKeyRef}
      tabIndex={-1}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <div
        id="pixi"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div id="main_stage" />
      </div>
    </div>
  );
};
export default Simulator;
