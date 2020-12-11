import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  playPause,
  selectWavesurfer,
  wavesurferSlice,
} from "./wavesurferSlice";
import WaveSurferApp from "./wavesurferApp";
/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const { status } = useSelector(selectWavesurfer);
  const [waveSurferApp, setWaveSurferApp] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setWaveSurferApp(new WaveSurferApp());
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
