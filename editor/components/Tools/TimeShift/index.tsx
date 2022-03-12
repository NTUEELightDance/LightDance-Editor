import React, { useState } from "react";
// mui
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { SelectChangeEvent } from "@mui/material";
//components
import TimeShiftTextField from "./TimeShiftTextField";
// states and actions
import { shiftFrameTime } from "core/actions";
//types
import { TimeShiftTool } from "types/components/tools";
//utils
import { notification } from "core/utils";

const CONTROL = "control";
const POSITION = "position";
const BOTH = "both";

export default function TimeShift({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  // type
  const [type, setType] = useState<TimeShiftTool>(CONTROL); // another is POSITION
  const handleChangeType = (
    event: SelectChangeEvent<"control" | "position" | "both">
  ) => setType(event.target.value as TimeShiftTool);

  // frame index
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // time
  const [shiftTime, setShiftTime] = useState(0);
  const handleChangeShiftTime = (e: React.ChangeEvent<HTMLInputElement>) =>
    setShiftTime(e.target.valueAsNumber);

  // submit
  const submitTimeShift = async () => {
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
    if (!window.confirm("Warning! This action may delete some important data."))
      return;
    await shiftFrameTime({ payload: { type, startTime, endTime, shiftTime } });
    setStartTime(0);
    setEndTime(0);
    setShiftTime(0);
    setType(CONTROL);
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} disableEnforceFocus>
      <DialogTitle>Time Shift Tool</DialogTitle>
      <DialogContent sx={{ width: "20em" }}>
        <Stack alignItems="center" gap="1.5em">
          <FormControl size="small" sx={{ width: "9em" }}>
            <Select value={type} onChange={handleChangeType}>
              <MenuItem value={CONTROL}>Control</MenuItem>
              <MenuItem value={POSITION}>Position</MenuItem>
              <MenuItem value={BOTH}>Both</MenuItem>
            </Select>
          </FormControl>
          <TimeShiftTextField
            label="Start Time"
            time={startTime}
            setTime={setStartTime}
          />
          <TimeShiftTextField
            label="End Time"
            time={endTime}
            setTime={setEndTime}
          />
          <TextField
            type="number"
            label="shiftTime (ms)"
            size="small"
            value={shiftTime}
            onChange={handleChangeShiftTime}
            sx={{ width: "9em" }}
          />
          <Button sx={{ width: "5em" }} onClick={submitTimeShift}>
            OK
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
