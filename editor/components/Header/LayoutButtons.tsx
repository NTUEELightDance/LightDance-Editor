import { useContext } from "react";
import { Box, Button } from "@mui/material";
import { layoutContext } from "types/layout";
import { LayoutContext } from "contexts/LayoutContext";
export const LayoutButtons = ({}) => {
  const {
    preferences: { mode },
    setMode,
  } = useContext(LayoutContext) as layoutContext;

  return (
    <Box sx={{ display: "flex", gap: "1vw" }}>
      <Button
        variant={mode === "editor" ? "contained" : "text"}
        sx={{ display: "block" }}
        onClick={() => setMode("editor")}
        size="small"
      >
        editor
      </Button>
      <Button
        variant={mode === "command" ? "contained" : "text"}
        sx={{ display: "block" }}
        onClick={() => setMode("command")}
        size="small"
      >
        command center
      </Button>
    </Box>
  );
};
