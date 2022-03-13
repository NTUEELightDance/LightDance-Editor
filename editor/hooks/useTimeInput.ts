import React, {
  useState,
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
} from "react";

import { formatDisplayedTime } from "core/utils";

const useTimeInput = ([externalTimeValue, setExternalTimeValue]: [
  number,
  React.Dispatch<React.SetStateAction<number>>
]) => {
  const [displayedTime, setDisplayedTime] = useState<string>("00:00:000");
  const [timeError, setTimeError] = useState<boolean>(false);

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
  // convert displayed time string to milli seconds
  const toMillis = (timeString: string) => {
    if (!validateTime(timeString)) {
      throw "invalid time";
    }
    const [mins, secs, millis] = timeString.split(":").map(Number);
    const newTime: number = Math.floor(mins * 60 + secs) * 1000 + millis;
    return newTime;
  };
  const updateCurrentTime = (newTime: number) => {
    try {
      setExternalTimeValue(newTime);
    } catch {
      setTimeError(true);
    }
  };

  const handleSetTime = () => {
    const newTimeList = displayedTime.split(":");
    const newDisplayedTime = displayedTime + ":".repeat(3 - newTimeList.length);

    if (!validateTime(newDisplayedTime)) return;
    try {
      const newTime = toMillis(newDisplayedTime);
      updateCurrentTime(newTime);
      setDisplayedTime(formatDisplayedTime(newTime));
    } catch {
      setTimeError(true);
    }
  };

  const textFieldProps = {
    error: timeError,
    style: { width: "9em" },
    value: displayedTime,
    inputProps: { min: 0 },
    onChange: ((e) => {
      updateDisplayedTime(e.target.value);
    }) as ChangeEventHandler<HTMLInputElement>,
    onBlur: () => {
      handleSetTime();
    },
    onKeyDown: ((e) => {
      if (e.key === "Enter") {
        handleSetTime();
      }
    }) as KeyboardEventHandler,
  };

  useEffect(() => {
    setDisplayedTime(formatDisplayedTime(externalTimeValue));
  }, []);

  return {
    textFieldProps,
  };
};

export default useTimeInput;
