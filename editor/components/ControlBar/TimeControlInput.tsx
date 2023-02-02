// mui
import { Stack, TextField, Typography, Popper, Paper } from "@mui/material";
// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { setCurrentTime } from "core/actions";

import useTimeInput from "hooks/useTimeInput";

function TimeControlInput() {
  const currentTime = useReactiveVar(reactiveState.currentTime);
  const { textFieldProps, timeError, timeInputRef } = useTimeInput([
    currentTime,
    (newTime: number) => {
      setCurrentTime({ payload: newTime });
    },
  ]);

  return (
    <Stack direction="row" alignItems="center" gap="1em">
      <Typography variant="body1">time:</Typography>
      <TextField
        {...textFieldProps}
        sx={{ width: "9em" }}
        size="small"
        variant="outlined"
        error={timeError}
      />
      {timeError && (
        <Popper open={timeError} anchorEl={timeInputRef.current}>
          <Paper>
            <Typography sx={{ p: "0.5em 1em" }}>
              this is an invalid time
            </Typography>
          </Paper>
        </Popper>
      )}
    </Stack>
  );
}

export default TimeControlInput;
