import { useContext } from "react";
import { Box, Button } from "@mui/material";
import { layoutContext } from "types/layout";
import { LayoutContext } from "contexts/LayoutContext";
export const LayoutButtons = ({}) => {
  const { mode, setMode } = useContext(LayoutContext) as layoutContext;

  return (
    <Box sx={{ display: "flex", gap: "1vw" }}>
      <Button
        variant={mode === "editor" ? "contained" : "text"}
        sx={{ color: "white", display: "block" }}
        onClick={() => setMode("editor")}
      >
        editor
      </Button>
      <Button
        variant={mode === "command" ? "contained" : "text"}
        sx={{ color: "white", display: "block" }}
        onClick={() => setMode("command")}
      >
        command center
      </Button>
    </Box>
  );
};
