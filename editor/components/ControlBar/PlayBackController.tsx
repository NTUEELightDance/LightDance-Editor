import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
import LoopIcon from "@material-ui/icons/Loop";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

const PlayBackController = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  // event
  const handlePlayPause = () => wavesurfer.playPause();
  const handleStop = () => wavesurfer.stop();
  const handlePlayLoop = () => wavesurfer.playLoop();

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
    <div>
      <IconButton color="default" onClick={handlePlayPause}>
        <PlayArrowIcon /> / <PauseIcon />
      </IconButton>
      <IconButton color="default" onClick={handleStop}>
        <StopIcon />
      </IconButton>
      <IconButton color="default" onClick={handlePlayLoop}>
        <LoopIcon />
      </IconButton>
    </div>
  );
};

export default PlayBackController;
