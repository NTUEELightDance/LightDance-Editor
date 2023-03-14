import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import EyeIcon from "@mui/icons-material/Visibility";

import { threeController } from "@/components/ThreeSimulator/ThreeController";

function LEDEditorDash() {
  const editor = useReactiveVar(reactiveState.editor);
  const editorState = useReactiveVar(reactiveState.editorState);
  const referenceDancerName = useReactiveVar(
    reactiveState.currentLEDEffectReferenceDancer
  );
  const currentLEDEffectName = useReactiveVar(
    reactiveState.currentLEDEffectName
  );
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);

  if (editor === "LED_EDITOR" && editorState === "EDITING") {
    return (
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <div>
          <Typography>Current LED Part: {currentLEDPartName}</Typography>
          <Typography>Current LED Effect: {currentLEDEffectName}</Typography>
        </div>
        <IconButton
          onClick={() => {
            if (!currentLEDPartName || !referenceDancerName) return;

            threeController.focusOnLEDPart(
              referenceDancerName,
              currentLEDPartName
            );
          }}
        >
          <EyeIcon />
        </IconButton>
      </Box>
    );
  } else {
    return null;
  }
}

export default LEDEditorDash;
