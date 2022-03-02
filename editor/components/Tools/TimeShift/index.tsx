import React, { useState } from "react";
// material ui
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
// states and actions
import { shiftFrameTime } from "core/actions";
//types
import { TimeShiftTool } from "types/components/tools";
// hooks
import useControl from "hooks/useControl";
import usePos from "hooks/usePos";

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
  const { controlRecord } = useControl();
  const { posRecord } = usePos();
  // type
  const [type, setType] = useState<TimeShiftTool>(CONTROL); // another is POSITION
  const handleChangeType = (frameType: TimeShiftTool) => setType(frameType);

  // frame index
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const handleChangeStartFrame = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStartTime(e.target.valueAsNumber);
  const handleChangeEndFrame = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEndTime(e.target.valueAsNumber);

  // time
  const [shiftTime, setShiftTime] = useState(0);
  const handleChangeShiftTime = (e: React.ChangeEvent<HTMLInputElement>) =>
    setShiftTime(e.target.valueAsNumber);

  // submit
  const submitTimeShift = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startTime < 0) {
      window.alert("Invalid Start Time");
      return;
    }
    if (endTime < 0) {
      window.alert("Invalid End Time");
      return;
    }
    if (startTime > endTime) {
      window.alert("Invalid, startTime should <= endTime");
      return;
    }
    window.alert("Warning! This action may delete some important data.");
    await shiftFrameTime({ payload: { type, startTime, endTime, shiftTime } });
    setStartTime(0);
    setEndTime(0);
    setShiftTime(0);
    setType(CONTROL);
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle> Time Shift Tool</DialogTitle>
      <DialogContent>
        <form onSubmit={submitTimeShift}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormControl fullWidth size="small">
              <Select
                value={type}
                onChange={(e) =>
                  handleChangeType(e.target.value as TimeShiftTool)
                }
              >
                <MenuItem value={CONTROL}>Control</MenuItem>
                <MenuItem value={POSITION}>Position</MenuItem>
                <MenuItem value={BOTH}>Both</MenuItem>
              </Select>
            </FormControl>
            <br />
            <TextField
              type="number"
              label="Start Time(ms)"
              onChange={handleChangeStartFrame}
              value={startTime}
            />
            <br />
            <TextField
              type="number"
              label="End Time(ms)"
              onChange={handleChangeEndFrame}
              value={endTime}
            />
            <br />
            <TextField
              type="number"
              label="shiftTime (ms)"
              onChange={handleChangeShiftTime}
              value={shiftTime}
            />
            <br />
            <Button type="submit">OK</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
