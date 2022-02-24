import { useEffect, useState, useRef } from "react";
// mui
import { Stack, TextField, Typography, Popper, Paper } from "@mui/material";
// type

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
import {
  setCurrentTime,
  setCurrentControlIndex,
  setCurrentPosIndex,
} from "../../core/actions";

const TimeControlInput = () => {
  const currentTime = useReactiveVar(reactiveState.currentTime);

  const [displayedTime, setDisplayedTime] = useState<string>("00:00:000");
  const [timeError, setTimeError] = useState<boolean>(false);
  const timeInputRef = useRef<HTMLDivElement>(null);

  // validate current display time and set time error
  const validateTime = (timeString: string) => {
    const timeList = timeString.split(":").map(Number);
    if (timeList.length !== 3) {
      setTimeError(true);
      return false;
    }
    for (let i = 0; i < 3; i++) {
      if (isNaN(timeList[i])) {
        setTimeError(true);
        return false;
      }
    }
    setTimeError(false);
    return true;
  };
  // update displayed time and pprovide user friendly corrections
  const updateDisplayedTime = (newDisplayedTime: string) => {
    const timeList = newDisplayedTime.split(":").map(Number);
    for (const time of timeList) {
      if (isNaN(time)) {
        setDisplayedTime(newDisplayedTime);
        setTimeError(true);
        return;
      }
    }
    const timeStrList = newDisplayedTime.split(":");
    const newTimeStrList = newDisplayedTime.split(":");
    switch (timeList.length) {
      case 1:
        if (newDisplayedTime.length > 0)
          newTimeStrList[0] = newDisplayedTime.substring(0, 1);
        if (newDisplayedTime.length > 1)
          newTimeStrList[1] = newDisplayedTime.substring(
            1,
            Math.min(3, newDisplayedTime.length)
          );
        if (newDisplayedTime.length > 3)
          newTimeStrList[2] = newDisplayedTime.substring(
            3,
            Math.min(6, newDisplayedTime.length)
          );
        setDisplayedTime(newTimeStrList.join(":"));
        break;
      case 2:
        if (timeStrList[1].length > 0)
          newTimeStrList[1] = timeStrList[1].substring(
            0,
            Math.min(2, timeStrList[1].length)
          );
        if (timeStrList[1].length > 2)
          newTimeStrList[2] = timeStrList[1].substring(
            2,
            Math.min(5, timeStrList[1].length)
          );
        setDisplayedTime(newTimeStrList.join(":"));
        break;
      case 3:
        // do nothing
        setDisplayedTime(newDisplayedTime.substring(0, 8));
        break;
      default:
        setDisplayedTime(newDisplayedTime);
        validateTime(newDisplayedTime);
    }
  };
  // convert displayed time string to millis seconds, then set current time
  const updateCurrentTime = (timeString: string) => {
    if (!validateTime(timeString)) return;
    const [mins, secs, millis] = timeString.split(":").map(Number);
    const newTime = (mins * 60 + secs) * 1000 + millis;
    try {
      setCurrentTime({ payload: newTime });
    } catch {
      setTimeError(true);
    }
  };
  // convert millis seconds to displayed time string
  const formatDisplayedTime = (time: number) => {
    const millis = String(time % 1000).padStart(3, "0");
    time = Math.floor(time / 1000);
    const secs = String(time % 60).padStart(2, "0");
    time = Math.floor(time / 60);
    const mins = String(time % 60);

    return `${mins}:${secs}:${millis}`;
  };

  const handleSetTime = () => {
    const newTimeList = displayedTime.split(":");
    const newDisplayedTime = displayedTime + ":".repeat(3 - newTimeList.length);

    if (!validateTime(newDisplayedTime)) return;
    updateCurrentTime(newDisplayedTime);
    setDisplayedTime(formatDisplayedTime(currentTime));
  };

  // update displayed time when current time is changed else where
  useEffect(() => {
    setDisplayedTime(formatDisplayedTime(currentTime));
    setTimeError(false);
  }, [currentTime]);
  return (
    <Stack direction="row" alignItems="center" gap="1em">
      <Typography variant="body1">time:</Typography>
      <TextField
        error={timeError}
        style={{ width: "9em" }}
        size="small"
        variant="outlined"
        value={displayedTime}
        inputProps={{ min: 0 }}
        ref={timeInputRef}
        onChange={(e) => updateDisplayedTime(e.target.value)}
        onBlur={handleSetTime}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSetTime();
        }}
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
};

export default TimeControlInput;
