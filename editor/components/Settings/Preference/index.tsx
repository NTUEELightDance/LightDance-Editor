import { useState } from "react";
import { Box } from "@mui/material";

import { layoutMode } from "types/layout";
import MarkerSwitch from "./MarkerSwitch";
// import { PreferenceSelector } from "./PreferenceSelector";

function Preference() {
  // const [mode, setMode] = useState<layoutMode>("editor");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      {/* <PreferenceSelector
        label="mode"
        value={mode}
        Options={["editor", "command"]}
        onChange={(e) => {
          setMode(e.target.value as layoutMode);
        }}
      /> */}
      <MarkerSwitch />
    </Box>
  );
}

export default Preference;
