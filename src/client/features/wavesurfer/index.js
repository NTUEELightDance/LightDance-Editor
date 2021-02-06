import React, { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { playPause, selectGlobal, updateTimeData } from "../globalSlice";

import { ControllerContext } from "../../controllerContext";
import store from "../../store";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const controller = useContext(ControllerContext);
  const [frameInput, setFrameInput] = useState("");
  const { posRecord, timeData } = useSelector(selectGlobal);
  const { controlFrame, posFrame, time } = timeData;

  const dispatch = useDispatch();

  const handlePlayPause = () => {
    controller.wavesurferApp.playPause();
    dispatch(playPause());
  };

  const handleInputChange = (event) => {
    setFrameInput(event.target.value);
  };

  const handleSetFrame = (event) => {
    console.log(frameInput, controller.wavesurferApp);
    const newFrame = parseInt(frameInput, 10);
    const newTimeData = controller.updateTimeDataByFrame(newFrame);
    console.log(newTimeData);
    if (timeData !== {}) {
      store.dispatch(updateTimeData(newTimeData));
    }
    event.preventDefault();
  };

  return (
    <>
      <form onSubmit={handleSetFrame}>
        <label>
          ControlFrame:
          <input
            type="text"
            name="frame"
            value={frameInput}
            onChange={handleInputChange}
          />
        </label>
        <input type="button" value="Submit" onClick={handleSetFrame} />
      </form>

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
