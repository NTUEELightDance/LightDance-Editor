import React, { useState } from "react";
// mui
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { SelectChangeEvent } from "@mui/material";
// components
import TimeShiftTextField from "./TimeShiftTextField";
// utils
import { notification, confirmation } from "core/utils";
import { Box } from "@mui/system";

import { timeShiftAgent } from "@/api";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";

export type TimeShiftTool = "control" | "position" | "both";

export default function TimeShift({
  setTimeShiftOpen,
}: {
  setTimeShiftOpen: (isOpen: boolean) => void;
}) {
  const currentTime = useReactiveVar(reactiveState.currentTime);
  // type
  const [type, setType] = useState<TimeShiftTool>("control"); // another is POSITION
  const handleChangeType = (
    event: SelectChangeEvent<"control" | "position" | "both">
  ) => {
    setType(event.target.value as TimeShiftTool);
  };

  // frame index
  const [startTime, setStartTime] = useState(currentTime);
  const [endTime, setEndTime] = useState(0);

  // time
  const [shiftTime, setShiftTime] = useState(0);
  const handleChangeShiftTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShiftTime(e.target.valueAsNumber);
  };

  // submit
  const submitTimeShift = async () => {
    setTimeShiftOpen(false);
    if (startTime < 0) {
      notification.error("Invalid Start Time");
      return;
    }
    if (endTime < 0) {
      notification.error("Invalid End Time");
      return;
    }
    if (startTime > endTime) {
      notification.error("Invalid, startTime should be smaller than endTime");
      return;
    }
    if (
      !(await confirmation.warning(
        "Warning! This action may delete some important data."
      ))
    ) {
      return;
    }

    try {
      await timeShiftAgent.shift({
        interval: [startTime, endTime],
        displacement: shiftTime,
        frameType: type,
      });
      notification.success("Time shift successful!");
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
    setStartTime(0);
    setEndTime(0);
    setShiftTime(0);
    setType("control");
  };
  return (
    <Box>
      <Stack alignItems="center" gap="1.5em">
        <Typography variant="h6">Time Shift Tool</Typography>
        <FormControl size="small" sx={{ width: "9em" }}>
          <Select value={type} onChange={handleChangeType}>
            <MenuItem value={"control"}>Control</MenuItem>
            <MenuItem value={"position"}>Position</MenuItem>
            <MenuItem value={"both"}>Both</MenuItem>
          </Select>
        </FormControl>
        <TimeShiftTextField
          label="Start Time"
          time={startTime}
          setTime={setStartTime}
          autoFocus
        />
        <TimeShiftTextField
          label="End Time"
          time={endTime}
          setTime={setEndTime}
        />
        <TextField
          type="number"
          label="Shift time (ms)"
          size="small"
          value={shiftTime}
          onChange={handleChangeShiftTime}
          sx={{ width: "9em" }}
        />
        <Button sx={{ width: "5em" }} onClick={submitTimeShift}>
          OK
        </Button>
      </Stack>
    </Box>
  );
}
