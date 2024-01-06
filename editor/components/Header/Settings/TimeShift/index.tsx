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
import FrameShiftTextField from "./FrameShiftTextField";
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
  const currentFrame = useReactiveVar(reactiveState.currentTime);
  console.log(currentFrame);
  // type
  const [type, setType] = useState<TimeShiftTool>("control"); // another is POSITION
  const handleChangeType = (
    event: SelectChangeEvent<"control" | "position" | "both">
  ) => {
    setType(event.target.value as TimeShiftTool);
  };

  // frame index
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [endFrame, setEndFrame] = useState(0);

  // time
  const [shiftFrame, setShiftFrame] = useState(0);
  const handleChangeShiftFrame = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShiftFrame(e.target.valueAsNumber);
  };

  // submit
  const submitFrameShift = async () => {
    console.log(startFrame, typeof(endFrame))
    setTimeShiftOpen(false);
    if (startFrame < 0) {
      notification.error("Invalid Start Frame");
      return;
    }
    if (endFrame < 0) {
      notification.error("Invalid End Frame");
      return;
    }
    if (startFrame > endFrame) {
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
        interval: [startFrame, endFrame],
        displacement: shiftFrame,
        frameType: type,
      });
      notification.success("Frame shift successful!");
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
    setStartFrame(0);
    setEndFrame(0);
    setShiftFrame(0);
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
        <FrameShiftTextField
          label="Start Frame"
          frame={startFrame}
          setFrame={setStartFrame}
          autoFocus
        />
        <FrameShiftTextField
          label="End Frame"
          frame={endFrame}
          setFrame={setEndFrame}
        />
        <TextField
          type="number"
          label="Shift frame"
          size="small"
          value={shiftFrame}
          onChange={handleChangeShiftFrame}
          sx={{ width: "9em" }}
        />
        <Button sx={{ width: "5em" }} onClick={submitFrameShift}>
          OK
        </Button>
      </Stack>
    </Box>
  );
}
