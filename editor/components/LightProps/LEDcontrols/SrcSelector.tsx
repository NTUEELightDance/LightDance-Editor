// mui
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

// no-effect
import { NO_EFFECT } from "@/constants";

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
  const handleChange = (e: SelectChangeEvent) => {
    handleSrcChange(e.target.value);
  };

  // handle no effect option and the display
  const options = [NO_EFFECT, ...effectNames];
  const optionDisplay = (val: string) =>
    val === NO_EFFECT ? "no-effect" : val;

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
