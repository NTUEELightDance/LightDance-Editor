import { Box } from "@mui/material";
import { useContext } from "react";
import { LayoutContext } from "contexts/LayoutContext";
import { layoutContext, editorPreference } from "../../../types/layout";
import MarkerSwitch from "./MarkerSwitch";
import { PreferenceSelector } from "./PreferenceSelector";

const Preference = () => {
  const {
    preferences: { editor },
    setEditor,
  } = useContext(LayoutContext) as layoutContext;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      <PreferenceSelector
        label="prefered editor"
        value={editor}
        Options={["default", "mirrored", "legacy", "beta"]}
        onChange={(e) => {
          setEditor(e.target.value as editorPreference);
        }}
      />
      <MarkerSwitch />
    </Box>
  );
};

export default Preference;
