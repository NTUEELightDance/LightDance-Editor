import React, { useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useSelector, useDispatch } from "react-redux";
import {
  playPause,
  selectWavesurfer,
  wavesurferSlice,
} from "./wavesurferSlice";
/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const { status } = useSelector(selectWavesurfer);
  const [waveSurferApp, setWaveSurferApp] = useState(null);
  const dispatch = useDispatch();

  const initailize = () => {
    const wavesurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "tomato",
      progressColor: "purple",
    });
    wavesurfer.load("./asset/music.flac");
    return wavesurfer;
  };

  useEffect(() => {
    const wavesurfer = initailize();
    setWaveSurferApp(wavesurfer);
  }, []);

  useEffect(() => {
    if (waveSurferApp) waveSurferApp.playPause();
  }, [status]);

  const handlePlayPause = () => {
    dispatch(playPause());
  };

  return (
    <>
      <button onClick={handlePlayPause}>Play/Pause</button>
      <div id="waveform">wavesurfer</div>
    </>
  );
};

export default Wavesurfer;
