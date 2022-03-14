import { Box, Button } from "@mui/material";

import { useLayout } from "contexts/LayoutContext";

export const LayoutButtons = ({}) => {
  const {
    preferences: { mode },
    setMode,
  } = useLayout();

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
