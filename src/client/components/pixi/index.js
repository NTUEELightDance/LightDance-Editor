import React, { useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { selectGlobal } from "../../slices/globalSlice";
import { ControllerContext } from "../../contexts/controller";

/**
 * This is Display component
 *
 * @component
 */

const Pixi = () => {
  const controller = useContext(ControllerContext);
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
