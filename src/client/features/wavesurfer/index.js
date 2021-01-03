import React, { useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useSelector, useDispatch } from "react-redux";
import {
  playPause,
  selectGlobal,
  udpateTime,
  findCurrentFrame,
} from "../globalSlice";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const { status, time } = useSelector(selectGlobal);
  const [wavesurferApp, setWavesurferApp] = useState(null);
  const dispatch = useDispatch();

  const initailize = () => {
    const wavesurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "tomato",
      progressColor: "purple",
    });
    wavesurfer.load("./asset/eenight.wav");
    wavesurfer.on("seek", () => {
      dispatch(
        findCurrentFrame(Math.round(wavesurfer.getCurrentTime() * 1000))
      );
    });
    wavesurfer.on("audioprocess", () => {
      dispatch(udpateTime(Math.round(wavesurfer.getCurrentTime() * 1000)));
    });
    return wavesurfer;
  };

  useEffect(() => {
    const wavesurfer = initailize();
    setWavesurferApp(wavesurfer);
  }, []);

  useEffect(() => {
    if (wavesurferApp) wavesurferApp.playPause();
  }, [status]);

  const handlePlayPause = () => {
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
