import React, { useState, useEffect } from "react";
// redux
import { useSelector } from "react-redux";
// actions
import { selectGlobal } from "../../slices/globalSlice";
// my-class
import Controller from "./Controller";
// useSelector

/**
 * This is Display component
 *
 * @component
 */

const Simulator: React.FC = ({}) => {
  const { currentStatus, currentPos, isPlaying } = useSelector(selectGlobal);
  const [controller, setController] = useState<Controller | null>(null);

  useEffect(() => {
    if (!controller) {
      console.log("new controllers");
      const newController = new Controller();
      newController.init();
      setController(newController);
    }
  }, []);

  useEffect(() => {
    if (controller) {
      controller.updateDancersStatus(currentStatus);
    }
  }, [controller, currentStatus]);

  useEffect(() => {
    if (controller) {
      controller.updateDancersPos(currentPos);
    }
  }, [controller, currentPos]);

  useEffect(() => {
    if (controller) {
      if (isPlaying) {
        controller.fetch();
        controller.play();
      } else {
        controller.stop();
      }
    }
  }, [isPlaying]);

  return (
    <div
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
