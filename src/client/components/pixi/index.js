import React, { useEffect, useContext } from "react";
// redux
import { useSelector } from "react-redux";
// actions
import { selectGlobal } from "../../slices/globalSlice";
// context
import { ControllerContext } from "../../contexts/controller";

/**
 * This is Display component
 *
 * @component
 */

const Pixi = () => {
  const controller = useContext(ControllerContext);
  const { currentStatus, currentPos } = useSelector(selectGlobal);

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
  // const { timeData, controlRecord, posRecord } = useSelector(selectGlobal);
  // const { time, controlFrame, posFrame } = timeData;

  // // TOKILL
  // useEffect(() => {
  //   // console.log(time, controlFrame);
  //   if (controller) {
  //     controller.updateDancersPos(posRecord, time, posFrame);
  //   }
  // }, [time]);

  // // TODO, update by currentStatus

  // useEffect(() => {
  //   // console.log(time, controlFrame);
  //   if (controller) {
  //     controller.updateDancersControl(controlRecord, controlFrame);
  //   }
  // }, [controlFrame]);

  // useEffect(() => {
  //   // console.log(time, controlFrame);
  //   if (controller) {
  //     controller.updateDancersPos(posRecord, time, posFrame);
  //   }
  // }, [posFrame]);

  return (
    <div className="Simulator d-inline-block">
      <div id="main_stage" />
    </div>
  );
};

export default Pixi;
