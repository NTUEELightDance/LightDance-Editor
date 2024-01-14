import { Stack, TextField, Typography, Popper, Paper } from "@mui/material";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import { useState } from "react";

function PlayBackController({ wavesurfer }: { wavesurfer: WaveSurferApp }) {
  // event
  const handlePlayPause = () => {
    wavesurfer.playPause();
  };

  const [ rate, setRate ] = useState(1);
  const handleRate = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const rate = e.target.value;
    const invalidInput = !(rate && parseFloat(rate))
    if(invalidInput) {
      return
    }
    else {
      setRate(parseFloat((Math.max(0.01,Math.min(parseFloat(rate),4))).toFixed(2)))
    }
    // wavesurfer.setPlaybackRate(invalidInput ? 1 : (Math.max(0.01,Math.min(parseFloat(rate),4))));
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
      <Stack direction="row" alignItems="center" gap="0.5em">
        <Typography variant="body1">speed:</Typography>
        <TextField
          sx={{ width: "4em" }}
          size="small"
          variant="outlined"
          onChange={(e) => {handleRate(e)}}
          value={rate}
        />
        <Typography variant="body1">x</Typography>
      </Stack>
    </>
  );
}

export default PlayBackController;
