import React, { useEffect, useContext } from "react";
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
  const { isPlaying, posRecord, timeData } = useSelector(selectGlobal);
  const { controlFrame, posFrame, time } = timeData;

  const dispatch = useDispatch();

  const handlePlayPause = () => {
    controller.wavesurferApp.playPause();
    dispatch(playPause());
  };

  return (
    <>
      <button onClick={handlePlayPause} type="button">
        Play/Pause
      </button>
      <button
        onClick={() => controller.downloadJson(posRecord, "position.json")}
        type="button"
      >
        Download position
      </button>
      <div id="waveform">
        wavesurfer time:{time} controlFram:{controlFrame} posFrame: {posFrame}
      </div>
    </>
  );
};

export default Wavesurfer;
