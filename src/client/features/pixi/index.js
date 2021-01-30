import React, { useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { selectGlobal } from "../globalSlice";
import { ControllerContext } from "../../controllerContext";

/**
 * This is Display component
 *
 * @component
 */

const Pixi = () => {
  const controller = useContext(ControllerContext);
  const { time, controlFrame, posFrame } = useSelector(selectGlobal);

  useEffect(() => {
    // console.log(time, controlFrame);
    if (controller) {
      controller.updateDancersPos(time, posFrame);
    }
  }, [time]);

  useEffect(() => {
    // console.log(time, controlFrame);
    if (controller) {
      controller.updateDancersControl(controlFrame);
    }
  }, [controlFrame]);

  useEffect(() => {
    // console.log(time, controlFrame);
    if (controller) {
      controller.updateDancersPos(time, posFrame);
    }
  }, [posFrame]);

  return (
    <div className="Simulator">
      <div id="main_stage" />
    </div>
  );
};

export default Pixi;
