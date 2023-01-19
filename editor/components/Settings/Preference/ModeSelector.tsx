import {
  Select,
  MenuItem,
  Typography,
  Box,
  SelectChangeEvent,
} from "@mui/material";

export function ModeSelector({
  label,
  value,
  Options,
  onChange,
}: {
  label: string;
  value: string;
  Options: string[];
  onChange: (e: SelectChangeEvent) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography>{label}</Typography>
      <Select value={value} onChange={onChange} size="small">
        {Options.map((preference) => (
          <MenuItem value={preference} key={preference}>
            <Typography textAlign="center">{preference}</Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
