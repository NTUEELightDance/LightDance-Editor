// mui
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

// no-effect
import { NO_EFFECT } from "@/constants";
import { LEDEffectID } from "@/core/models";

export interface SrcSelectorProps {
  effectID: LEDEffectID | null;
  effectIDs: LEDEffectID[];
  handleEffectIDChange: (effectID: LEDEffectID) => void;
}

/**
 * Led Src Selector
 * Select the effectName to be the src
 */
function LEDEffectSelector({
  effectID,
  effectIDs,
  handleEffectIDChange,
}: SrcSelectorProps) {
  const handleChange = (e: SelectChangeEvent) => {
    handleEffectIDChange(parseInt(e.target.value));
  };

  // handle no effect option and the display
  const options = [NO_EFFECT, ...effectIDs];
  const optionDisplay = (val: string) =>
    val === NO_EFFECT.toString() ? "no-effect" : val;

  return (
    <FormControl sx={{ width: "5.5vw", padding: 0 }} size="small">
      <InputLabel shrink>src</InputLabel>
      <Select
        value={effectID?.toString?.() ?? "-1"}
        label="src"
        onChange={handleChange}
        displayEmpty
        renderValue={optionDisplay}
      >
        {options.map((effectID) => (
          <MenuItem key={effectID} value={effectID} dense>
            {optionDisplay(effectID.toString())}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default LEDEffectSelector;
