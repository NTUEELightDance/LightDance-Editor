import { Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";

export const PreferenceSelector = ({
  value,
  onChange,
  Options,
}: {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
  Options: [string];
}) => {
  return (
    <Select value={value} onChange={onChange} size="medium">
      {Options.map((preference) => (
        <MenuItem value={preference}>
          <Typography textAlign="center">{preference}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};
