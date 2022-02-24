import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

import { IconButton, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import LoopIcon from "@mui/icons-material/Loop";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

const PlayBackController = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  // event
  const handlePlayPause = () => wavesurfer.playPause();
  const handleStop = () => wavesurfer.stop();
  const handlePlayLoop = () => wavesurfer.playLoop();

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
    <Box>
      <IconButton color="default" onClick={handlePlayPause}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <IconButton color="default" onClick={handleStop}>
        <StopIcon />
      </IconButton>
      <IconButton color="default" onClick={handlePlayLoop}>
        <LoopIcon />
      </IconButton>
    </Box>
  );
};

export default PlayBackController;
