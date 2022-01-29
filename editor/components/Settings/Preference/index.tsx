import { Box } from "@mui/material";
import { useContext } from "react";
import { LayoutContext } from "../../../contexts/LayoutContext";
import { layoutContext, editorPreference } from "../../../types/layout";
import { PreferenceSelector } from "./PreferenceSelector";

const Preference = () => {
  const { preferedEditor, setPreferedEditor } = useContext(
    LayoutContext
  ) as layoutContext;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
      <PreferenceSelector
        label="prefered editor"
        value={preferedEditor}
        Options={["default", "mirrored", "legacy"]}
        onChange={(e) => {
          setPreferedEditor(e.target.value as editorPreference);
        }}
      />
      <PreferenceSelector
        label="prefered editor"
        value={preferedEditor}
        Options={["default", "mirrored", "legacy"]}
        onChange={(e) => {
          setPreferedEditor(e.target.value as editorPreference);
        }}
      />
    </Box>
  );
};

export default Preference;
