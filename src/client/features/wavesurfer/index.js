import React, { useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { playPause, selectGlobal } from "../globalSlice";

import { ControllerContext } from "../../controllerContext";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const controller = useContext(ControllerContext);
  const { time } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  const handlePlayPause = () => {
    controller.wavesurferApp.playPause();
    dispatch(playPause());
  };

  return (
    <>
      <button onClick={handlePlayPause}>Play/Pause</button>
      <div id="waveform">wavesurfer {time}</div>
    </>
  );
};

export default Wavesurfer;
