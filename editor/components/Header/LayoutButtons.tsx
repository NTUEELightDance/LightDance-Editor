import { Box, Button } from "@mui/material";
import { layoutMode } from "types/layout";

export const LayoutButtons = ({
  setMode,
}: {
  setMode: (mode: layoutMode) => void;
}) => {
  return (
    <Box sx={{ display: "flex", gap: "1vw" }}>
      <Button
        sx={{ color: "white", display: "block" }}
        onClick={() => setMode("editor")}
      >
        editor
      </Button>
      <Button
        sx={{ color: "white", display: "block" }}
        onClick={() => setMode("command")}
      >
        command center
      </Button>
    </Box>
  );
};
