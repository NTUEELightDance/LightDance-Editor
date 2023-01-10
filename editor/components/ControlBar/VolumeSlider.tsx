import { useState } from "react";

import { Box, Stack, Slider, IconButton } from "@mui/material";
import {
  VolumeMute,
  VolumeDown,
  VolumeUp,
  VolumeOff
} from "@mui/icons-material";

import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

export default function VolumeSlider ({
  wavesurfer
}: {
  wavesurfer: WaveSurferApp
}) {
  const [volume, setVolume] = useState<number>(0.5);
  const [mute, setMute] = useState<boolean>(false);
  wavesurfer?.setVolume(mute ? 0 : volume);

  const handleChange = (event: Event, newVolume: number | number[]) => {
    setVolume(newVolume as number);
    wavesurfer?.setVolume(newVolume as number);
  };

  const handleMute = () => {
    setMute(!mute);
  };

  const VolumeIcon = mute
    ? (
      <VolumeOff />
    )
    : volume > 0.7
      ? (
        <VolumeUp />
      )
      : volume > 0.3
        ? (
          <VolumeDown />
        )
        : (
          <VolumeMute />
        );

  return (
    <Box width="15em" sx={{ fontSize: "0.8em" }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <IconButton onClick={handleMute}>{VolumeIcon} </IconButton>
        <Slider
          onChange={handleChange}
          min={0}
          max={1}
          step={0.01}
          value={mute ? 0 : volume}
        />
      </Stack>
    </Box>
  );
}
