import { useState } from "react";

import Paper from "@mui/material/Paper";

import LEDBulbsControlsContent from "./LEDBulbsControls/LEDBulbsControlsContent";

function LEDMode() {
  const [currentColorName, setCurrentColorName] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      <LEDBulbsControlsContent
        currentColorName={currentColorName}
        handleColorChange={setCurrentColorName}
        intensity={intensity}
        handleIntensityChange={setIntensity}
      />
    </Paper>
  );
}

export default LEDMode;
