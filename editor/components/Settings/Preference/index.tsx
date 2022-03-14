import { Box } from "@mui/material";

import { editorPreference, layoutMode } from "types/layout";
import MarkerSwitch from "./MarkerSwitch";
import { PreferenceSelector } from "./PreferenceSelector";

import { useLayout } from "contexts/LayoutContext";

const Preference = () => {
  const {
    preferences: { editor, mode },
    setEditor,
    setMode,
  } = useLayout();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      <PreferenceSelector
        label="prefered editor"
        value={editor}
        Options={["default", "mirrored"]}
        onChange={(e) => {
          setEditor(e.target.value as editorPreference);
        }}
      />
      <PreferenceSelector
        label="mode"
        value={mode}
        Options={["editor", "command"]}
        onChange={(e) => {
          setMode(e.target.value as layoutMode);
        }}
      />
      <MarkerSwitch />
    </Box>
  );
};

export default Preference;
