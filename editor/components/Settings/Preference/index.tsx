import { useState } from "react";
import { Box } from "@mui/material";

import { layoutMode, layoutType } from "types/layout";
import MarkerSwitch from "./MarkerSwitch";
import { ModeSelector } from "./ModeSelector";
import { LayoutSelector } from "./LayoutSelector";

import useLayout from "hooks/useLayout";

function Preference() {
  const [mode, setMode] = useState<layoutMode>("editor");
  const {layout, setLayout} = useLayout();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      <ModeSelector
        label="mode"
        value={mode}
        Options={["editor", "command"]}
        onChange={(e) => {
          setMode(e.target.value as layoutMode);
        }}
      />
      <LayoutSelector
        label="layout"
        value={layout}
        Options={["default", "custom"]}
        onChange={(e) => {
          setLayout(e.target.value as layoutType);
        }}
      />
      <MarkerSwitch />
    </Box>
  );
}

export default Preference;
