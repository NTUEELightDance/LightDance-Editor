import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import { useState } from "react";
import RateControlInput from "./RateControlInput";

function PlayBackController({ wavesurfer }: { wavesurfer: WaveSurferApp }) {
  // event
  const handlePlayPause = () => {
    wavesurfer.playPause();
  };

  const [ rate, setRate ] = useState("1.0");
  const handleChangeRate = (value: string) => {
    setRate(value)
    if (isNaN(Number(value)) || Number(value) <= 0 || Number(value) > 8) return
    wavesurfer.setPlaybackRate(Number(value));
  };

  const isPlaying = useReactiveVar(reactiveState.isPlaying);

  // press space for play pause
  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      handlePlayPause();
    },
    [wavesurfer]
  );

  return (
    <>
      <IconButton color="default" onClick={handlePlayPause}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <RateControlInput
        value={rate}
        handleChange={handleChangeRate}
      />
    </>
  );
}

export default PlayBackController;
