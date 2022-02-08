import React, { useContext } from "react";
import { WaveSurferAppContext } from "../../contexts/WavesurferContext";
import { Switch } from "@material-ui/core";
import { FormControlLabel } from "@material-ui/core";
import { wavesurferContext } from "types/components/wavesurfer";

export default function MarkerSwitch() {
  const { showMarkers, toggleMarkers } = useContext(
    WaveSurferAppContext
  ) as wavesurferContext;

  return (
    <FormControlLabel
      control={
        <Switch
          color="primary"
          checked={showMarkers}
          onChange={toggleMarkers}
        />
      }
      label="Markers"
      labelPlacement="start"
    />
  );
}
