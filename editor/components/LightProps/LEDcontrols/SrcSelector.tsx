// mui
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

// no-effect
import { NO_EFFECT } from "@/constants";
import { EffectID } from "@/core/models";

export interface SrcSelectorProps {
  effectID: EffectID | null;
  effectNames: string[];
  handleEffectIDChange: (effectID: EffectID) => void;
}

/**
 * Led Src Selector
 * Select the effectName to be the src
 */
function SrcSelector({
  effectID,
  effectNames,
  handleEffectIDChange,
}: SrcSelectorProps) {
  const handleChange = (e: SelectChangeEvent) => {
    handleEffectIDChange(parseInt(e.target.value));
  };

  // handle no effect option and the display
  const options = [-1, ...effectNames];
  const optionDisplay = (val: string) =>
    val === NO_EFFECT ? "no-effect" : val;

  return (
    <FormControl sx={{ width: "5.5vw", padding: 0 }} size="small">
      <InputLabel shrink>src</InputLabel>
      <Select
        type="number"
        value={effectID?.toString?.() ?? "-1"}
        label="src"
        onChange={handleChange}
        displayEmpty
        renderValue={optionDisplay}
      >
        {options.map((effectID) => (
          <MenuItem key={effectID} value={effectID} dense>
            {optionDisplay(effectID)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SrcSelector;
