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
  const { time, frame } = useSelector(selectGlobal);

  useEffect(() => {
    if (controller) controller.updateWhilePlaying(time, frame);
  }, [time]);

  return (
    <div className="Simulator">
      <div id="main_stage" />
    </div>
  );
};

export default Pixi;
