import { Select, MenuItem, Typography } from "@mui/material";
import { useContext } from "react";
import { LayoutContext } from "../../../contexts/LayoutContext";
import { layoutContext, editorPreference } from "../../../types/layout";

const Preference = () => {
  const { preferedEditor, setPreferedEditor } = useContext(
    LayoutContext
  ) as layoutContext;
  const editorPreferences = ["default", "legacy", "mirrored"];
  return (
    <>
      <Select
        value={preferedEditor}
        onChange={(e) => {
          setPreferedEditor(e.target.value as editorPreference);
        }}
        size="medium"
      >
        {editorPreferences.map((preference) => (
          <MenuItem value={preference}>
            <Typography textAlign="center">{preference}</Typography>
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default Preference;
