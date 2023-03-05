import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

import Paper from "@mui/material/Paper";
import DancerTree from "./DancerTree";
import LEDBulbsList from "./LEDBulbsList";

function ObjectsPanel() {
  const editor = useReactiveVar(reactiveState.editor);

  return (
    <Paper
      sx={{
        width: "100%",
        p: "1rem",
        pt: 0,
        minHeight: "100%",
        position: "relative",
      }}
      square
    >
      {editor === "CONTROL_EDITOR" || editor === "POS_EDITOR" ? (
        <DancerTree />
      ) : editor === "LED_EDITOR" ? (
        <LEDBulbsList />
      ) : null}
    </Paper>
  );

  throw new Error("Invalid editor");
}

export default ObjectsPanel;
