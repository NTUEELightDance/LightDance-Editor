import React, { useContext } from "react";
import { WaveSurferAppContext } from "../../contexts/wavesurferContext";
import { Switch } from "@material-ui/core";
import { FormControlLabel } from "@material-ui/core";
import { wavesurferContext } from "types/components/wavesurfer";

export default function MarkerSwitch() {
  const { markersToggle, toggleMarkers } = useContext(WaveSurferAppContext) as wavesurferContext;

  //toggle markers
  const handleChange = () => {
    toggleMarkers(!markersToggle);
  };

  return (
    <FormControlLabel
      control={
        <Switch
          color="primary"
          checked={markersToggle}
          onChange={handleChange}
        />
      }
      label="Markers"
      labelPlacement="start"
    />
  );
}
