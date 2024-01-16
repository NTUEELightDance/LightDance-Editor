import { TextField, Stack, Typography, Popper, Paper } from "@mui/material";
import { useRef, useState } from "react";

function RateControlInput({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ rateError, setRateError ] = useState(false)
  return (
    <Stack direction="row" alignItems="center" gap="1em">
      <Stack direction="row" alignItems="center" gap="2px">
        <TextField
          style={{ width: "4em" }}
          size="small"
          variant="outlined"
          value={value}
          error={rateError}
          inputRef={inputRef}
          onChange={(e) => {
            setRateError(isNaN(Number(e.target.value)) || Number(e.target.value) <= 0 || Number(e.target.value) > 8)
            handleChange(e.target.value);
          }}
        />
        {rateError && (
          <Popper open={rateError} anchorEl={inputRef.current}>
            <Paper>
              <Typography sx={{ p: "0.5em 1em" }}>
                playback rate (0, 8]
              </Typography>
            </Paper>
          </Popper>
        )}
        <Typography variant="body1">x</Typography>
      </Stack>
    </Stack>
  );
}

export default RateControlInput;
