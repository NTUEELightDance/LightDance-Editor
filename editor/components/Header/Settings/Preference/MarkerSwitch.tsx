import { useContext } from "react";
import { WaveSurferAppContext } from "../../../../contexts/WavesurferContext";
import Switch from "@mui/material/Switch";
import { FormControlLabel } from "@mui/material";
import { WavesurferContextType } from "@/contexts/WavesurferContext";

export default function MarkerSwitch() {
  const { showMarkers, toggleMarkers } = useContext(
    WaveSurferAppContext
  ) as WavesurferContextType;

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
