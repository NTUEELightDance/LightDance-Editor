// mui
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import { startEditing } from "@/core/actions";

export interface SrcSelectorProps {
  src: string | null;
  effectNames: string[];
  handleSrcChange: (src: string) => void;
}

/**
 * Led Src Selector
 * Select the effectName to be the src
 */
function SrcSelector({ src, effectNames, handleSrcChange }: SrcSelectorProps) {
  const editorState = useReactiveVar(reactiveState.editorState);
  const handleChange = async (e: SelectChangeEvent) => {
    if (editorState === "IDLE") await startEditing();
    handleSrcChange(e.target.value);
  };

  // handle no effect option and the display
  const options = ["", ...effectNames];
  const optionDisplay = (val: string) => (val === "" ? "no effect" : val);

  return (
    <FormControl sx={{ width: "5.5vw", padding: 0 }} size="small">
      <InputLabel shrink>src</InputLabel>
      <Select
        value={src ?? ""}
        label="src"
        onChange={handleChange}
        displayEmpty
        renderValue={optionDisplay}
      >
        {options.map((effectName) => (
          <MenuItem key={effectName} value={effectName} dense>
            {optionDisplay(effectName)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SrcSelector;