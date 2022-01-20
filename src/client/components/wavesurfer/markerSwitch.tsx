import React, { useContext } from "react";
import { WaveSurferAppContext } from "../../contexts/wavesurferContext";
import { Switch } from "@material-ui/core";
import { FormControlLabel } from "@material-ui/core";

export default function MarkerSwitch() {
  const { markersToggle, toggleMarkers } = useContext(WaveSurferAppContext);

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
