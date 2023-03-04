import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";

import Typography from "@mui/material/Typography";

function LEDEditorDisplay() {
  const editor = useReactiveVar(reactiveState.editor);
  const currentLEDEffectName = useReactiveVar(
    reactiveState.currentLEDEffectName
  );
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);

  if (editor !== "LED_EDITOR") {
    return null;
  }

  return (
    <div>
      <Typography>Current LED Effect: {currentLEDEffectName}</Typography>
      <Typography>Current LED Part: {currentLEDPartName}</Typography>
    </div>
  );
}

export default LEDEditorDisplay;
