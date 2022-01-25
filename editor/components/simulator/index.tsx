import React, { useState, useEffect } from "react";
// redux
import { useSelector } from "react-redux";
// actions
import { selectGlobal } from "../../slices/globalSlice";
// my-class
import Controller from "./controller";
// useSelector

/**
 * This is Display component
 *
 * @component
 */

const Simulator: React.FC = ({}) => {
  const { currentStatus, currentPos } = useSelector(selectGlobal);
  const [controller, setController] = useState<Controller | null>(null);

  useEffect(() => {
    const newController = new Controller();
    newController.init();
    setController(newController);
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
