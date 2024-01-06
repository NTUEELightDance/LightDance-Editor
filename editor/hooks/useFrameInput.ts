/// Maybe this is redundent 'cuz it doesn't need to change it into time format in the shifter

import React, { useState, useEffect, useRef } from "react";

// import { formatDisplayedTime } from "core/utils";

const useFrameInput = ([externalFrameValue, setExternalFrameValue]: [
  number,
  React.Dispatch<React.SetStateAction<number>> | ((newFrame: number) => void)
]) => {
  const [displayedFrame, setDisplayedFrame] = useState<number>(0);
  const [frameError, setFrameError] = useState<boolean>(false);

  // validate current display time and set time error
  // NOT NEEDED
  // const validateFrame = (timeString: string) => {
  //   const timeList = timeString.split(":").map(Number);
  //   if (timeList.length !== 3) {
  //     setFrameError(true);
  //     return false;
  //   }
  //   for (let i = 0; i < 3; i++) {
  //     if (isNaN(timeList[i])) {
  //       setFrameError(true);
  //       return false;
  //     }
  //   }
  //   setFrameError(false);
  //   return true;
  // };


  // update displayed time and provide user friendly corrections
  // const updateDisplayedFrame = (displayedFrame: string) => {
  //   // const new
  //   // const timeList = newDisplayedTime.split(":").map(Number);
  //   // for (const time of timeList) {
  //     if (isNaN(displayedFrame)) {
  //       setDisplayedFrame(displayedFrame);
  //       setFrameError(true);
  //       return;
  //     }
  //   // }
  //   const timeStrList = newDisplayedTime.split(":");
  //   const newTimeStrList = newDisplayedTime.split(":");
  //   switch (timeList.length) {
  //     case 1:
  //       if (newDisplayedTime.length > 0) {
  //         newTimeStrList[0] = newDisplayedTime.substring(0, 1);
  //       }
  //       if (newDisplayedTime.length > 1) {
  //         newTimeStrList[1] = newDisplayedTime.substring(
  //           1,
  //           Math.min(3, newDisplayedTime.length)
  //         );
  //       }
  //       if (newDisplayedTime.length > 3) {
  //         newTimeStrList[2] = newDisplayedTime.substring(
  //           3,
  //           Math.min(6, newDisplayedTime.length)
  //         );
  //       }
  //       setDisplayedFrame(newTimeStrList.join(":"));
  //       break;
  //     case 2:
  //       if (timeStrList[1].length > 0) {
  //         newTimeStrList[1] = timeStrList[1].substring(
  //           0,
  //           Math.min(2, timeStrList[1].length)
  //         );
  //       }
  //       if (timeStrList[1].length > 2) {
  //         newTimeStrList[2] = timeStrList[1].substring(
  //           2,
  //           Math.min(5, timeStrList[1].length)
  //         );
  //       }
  //       setDisplayedFrame(newTimeStrList.join(":"));
  //       break;
  //     case 3:
  //       // do nothing
  //       setDisplayedFrame(
  //         // 7 = 2':'s + 2 (seconds) + 3 (milliseconds)
  //         newDisplayedTime.substring(0, timeStrList[0].length + 7)
  //       );
  //       break;
  //     default:
  //       setDisplayedFrame(newDisplayedTime);
  //       // validateFrame(newDisplayedTime);
  //   }
  // };
  // convert displayed time string to milli seconds
  // const toMillis = (timeString: string) => {
    // if (!validateFrame(timeString)) {
    //   throw new Error("invalid time");
    // }
  //   const [mins, secs, millis] = timeString.split(":").map(Number);
  //   const newTime: number = Math.round(mins * 60 + secs) * 1000 + millis;
  //   return newTime;
  // };
  const updateCurrentFrame = (newFrame: number) => {
    try {
      setExternalFrameValue(newFrame);
    } catch(error) {
      setFrameError(true);
    }
  };

  const handleSetFrame = () => {
    const newTimeList = displayedFrame;
    // const newDisplayedTime = displayedTime + ":".repeat(3 - newTimeList.length);

    // if (!validateFrame(displayedFrame)) return;
    try {
      const newFrame = displayedFrame;
      updateCurrentFrame(newFrame);
      setDisplayedFrame(newFrame);
      frameInputRef.current?.blur();
    } catch {
      setFrameError(true);
    }
  };

  const handleArrowKeys = (key: "up" | "down", shiftKey?: boolean) => {
    const displayedFrameValue = displayedFrame;
    const delta = shiftKey ? 10 : 1;
    if (key === "up") {
      setDisplayedFrame(displayedFrameValue + delta);
    } else if (key === "down") {
      setDisplayedFrame(displayedFrameValue - delta);
    }
  };

  const frameInputRef = useRef<HTMLInputElement>();

  const textFieldProps = {
    error: frameError,
    style: { width: "9em" },
    value: displayedFrame,
    inputProps: { min: 0 },
    onChange: ((e) => {
      setDisplayedFrame(e.target.valueAsNumber);
    }) as React.ChangeEventHandler<HTMLInputElement>,
    onBlur: () => {
      handleSetFrame();
    },
    onKeyDown: ((e) => {
      const capturedKeys = ["Enter", "ArrowUp", "ArrowDown"];
      if (capturedKeys.includes(e.key)) e.preventDefault();

      if (e.key === "Enter") handleSetFrame();
      if (e.key === "ArrowUp") handleArrowKeys("up", e.shiftKey);
      if (e.key === "ArrowDown") handleArrowKeys("down", e.shiftKey);
    }) as React.KeyboardEventHandler,
    inputRef: frameInputRef as React.RefObject<HTMLInputElement>,
  };

  // update displayed time when current time is changed else where
  useEffect(() => {
    setDisplayedFrame(externalFrameValue);
    setFrameError(false);
  }, [externalFrameValue]);

  return {
    textFieldProps,
    frameError,
    frameInputRef,
  };
};

export default useFrameInput;
