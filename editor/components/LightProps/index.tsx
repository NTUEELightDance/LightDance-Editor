import { Paper } from "@mui/material";
import DancerMode from "./DancerMode";
import PartMode from "./PartMode";

import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";
import LEDMode from "./LEDMode";

function LightProps() {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  return (
    <>
      {selectionMode === "DANCER_MODE" ? (
        <DancerMode />
      ) : selectionMode === "PART_MODE" ? (
        <PartMode />
      ) : selectionMode === "LED_MODE" ? (
        <LEDMode />
      ) : (
        <Paper sx={{ width: "100%", height: "100%" }} square />
      )}
    </>
  );
}

export default LightProps;
