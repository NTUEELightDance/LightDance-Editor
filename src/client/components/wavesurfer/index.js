import React, { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  playPause,
  selectGlobal,
  updateTimeData,
  setNewPosRecord,
} from "../../slices/globalSlice";

import { ControllerContext } from "../../controllerContext";
import store from "../../store";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const controller = useContext(ControllerContext);
  const [controlFrameInput, setControlFrameInput] = useState("");
  const [posFrameInput, setPosFrameInput] = useState("");
  const { controlRecord, posRecord, timeData, currentStatus } = useSelector(
    selectGlobal
  );
  const { controlFrame, posFrame, time } = timeData;

  const dispatch = useDispatch();

  const handlePlayPause = () => {
    controller.wavesurferApp.playPause();
    dispatch(playPause());
  };

  const handleControlInputChange = (event) => {
    setControlFrameInput(event.target.value);
  };
  const handlePosInputChange = (event) => {
    setPosFrameInput(event.target.value);
  };

  const handleSetControlFrame = (event) => {
    console.log(controlFrameInput, controller.wavesurferApp);
    const newFrame = parseInt(controlFrameInput, 10);
    const newTimeData = controller.updateTimeDataByFrame(
      controlRecord,
      posRecord,
      newFrame,
      "control"
    );
    console.log(newTimeData);
    if (timeData !== {}) {
      store.dispatch(updateTimeData(newTimeData));
    }
    event.preventDefault();
  };

  const handleSetPosFrame = (event) => {
    console.log(posFrameInput, controller.wavesurferApp);
    const newFrame = parseInt(posFrameInput, 10);
    const newTimeData = controller.updateTimeDataByFrame(
      controlRecord,
      posRecord,
      newFrame,
      "position"
    );
    console.log(newTimeData);
    if (timeData !== {}) {
      store.dispatch(updateTimeData(newTimeData));
    }
    event.preventDefault();
  };

  const handleSaveControlFrame = () => {
    // controller.updateLocalStorage(
    //   "controlTest",
    //   store.getState().global.controlRecord
    // );
    console.log(controller.localStorage);
    // console.log(currentStatus);
  };

  const handleSavePosFrame = () => {
    controller.updateLocalStorage(
      "position",
      store.getState().global.posRecord
    );
  };

  return (
    <>
      {/* <button onClick={handleSaveControlFrame} type="button">
        Save Control Frame
      </button> */}
      <button onClick={handleSavePosFrame} type="button">
        Save Position Frame
      </button>
      <form onSubmit={handleSetControlFrame}>
        <label>
          ControlFrame:
          <input
            type="text"
            name="frame"
            value={controlFrameInput}
            onChange={handleControlInputChange}
          />
        </label>
        <input type="button" value="Submit" onClick={handleSetControlFrame} />
      </form>

      <form onSubmit={handleSetPosFrame}>
        <label>
          PosFrame:
          <input
            type="text"
            name="frame"
            value={posFrameInput}
            onChange={handlePosInputChange}
          />
        </label>
        <input type="button" value="Submit" onClick={handleSetPosFrame} />
      </form>

      <button onClick={handlePlayPause} type="button">
        Play/Pause
      </button>
      <button
        onClick={() => controller.downloadJson(posRecord, "position")}
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
