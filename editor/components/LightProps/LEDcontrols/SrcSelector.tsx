// mui
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

/**
 * Led Src Selector
 * Select the effectName to be the src
 */
function SrcSelector({
  src,
  effectNames,
  handleSrcChange,
}: {
  src: string;
  effectNames: string[];
  handleSrcChange: (src: string) => void;
}) {
  const handleChange = (e: SelectChangeEvent) => {
    handleSrcChange(e.target.value);
  };
  return (
    <FormControl sx={{ width: "5.5vw", padding: 0 }} size="small">
      <InputLabel>src</InputLabel>
      <Select value={src} label="src" onChange={handleChange}>
        {effectNames.map((effectName) => (
          <MenuItem key={effectName} value={effectName}>
            {effectName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SrcSelector;
