import { useState } from "react";

import { Box, Stack, Slider } from "@mui/material";
import { ZoomIn } from "@mui/icons-material";

import WaveSurferApp from "../Wavesurfer/WaveSurferApp";

export default function ScaleSlider({
  wavesurfer,
}: {
  wavesurfer: WaveSurferApp;
}) {
  const [scale, setScale] = useState<number>(0);

  const handleChange = (event: Event, newScale: number | number[]) => {
    // only zoom whem scale really be changed
    if ((newScale as number) !== scale) {
      wavesurfer?.zoom(newScale as number);
    }
    setScale(newScale as number);
  };

  return (
    <Box width="15em" sx={{ fontSize: "0.8em" }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <ZoomIn />
        <Slider
          onChange={handleChange}
          min={0}
          max={10}
          step={1}
          value={scale}
        />
      </Stack>
    </Box>
  );
}
