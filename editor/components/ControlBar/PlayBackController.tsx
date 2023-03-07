import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

function PlayBackController({ wavesurfer }: { wavesurfer: WaveSurferApp }) {
  // event
  const handlePlayPause = () => {
    wavesurfer.playPause();
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
    <IconButton color="default" onClick={handlePlayPause}>
      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
}

export default PlayBackController;
