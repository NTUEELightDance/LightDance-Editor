import { useEffect } from "react";
// mui
import { Stack } from "@mui/material";
import FrameControlInput from "./FrameControlInput";
import TimeControlInput from "./TimeControlInput";

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import {
  setCurrentControlIndex,
  setCurrentPosIndex,
  setCurrentTime,
} from "@/core/actions";
import { initStatusStack, initPosStack } from "@/core/actions";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";
// constants
import { CONTROL_EDITOR } from "@/constants";

import { throttle } from "lodash";

const THROTTLE = 100;

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);
  const currentPosIndex = useReactiveVar(reactiveState.currentPosIndex);
  const editor = useReactiveVar(reactiveState.editor);

  const handleChangeControlFrame = (value: number) => {
    setCurrentControlIndex({ payload: value });
  };

  const handleChangePosFrame = (value: number) => {
    setCurrentPosIndex({ payload: value });
  };

  const timeShift = (time: number): void => {
    // time increase / decrease several ms
    const currentTime = reactiveState.currentTime();
    const newTime = Math.max(0, currentTime + time);
    setCurrentTime({
      payload: newTime,
    });
  };

  useHotkeys(
    "left",
    throttle(() => {
      timeShift(-100);
    }, THROTTLE)
  );

  useHotkeys(
    "right",
    throttle(() => {
      // time increase 100ms
      timeShift(100);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+left",
    throttle(() => {
      // time decrease 500ms
      timeShift(-500);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+right",
    throttle(() => {
      // time increase 500ms
      timeShift(500);
    }, THROTTLE)
  );

  useHotkeys(
    "down",
    throttle(() => {
      if (editor === CONTROL_EDITOR) {
        setCurrentControlIndex({
          payload: currentControlIndex + 1,
        });
      } else
        setCurrentPosIndex({
          payload: currentPosIndex + 1,
        });
    }, THROTTLE),
    [currentControlIndex, currentPosIndex]
  );
  useHotkeys(
    "up",
    throttle(() => {
      if (editor === CONTROL_EDITOR) {
        setCurrentControlIndex({
          payload: currentControlIndex - 1,
        });
      } else
        setCurrentPosIndex({
          payload: currentPosIndex - 1,
        });
    }, THROTTLE),
    [editor, currentControlIndex, currentPosIndex]
  );

  useEffect(() => {
    // renew statusStack and posStack
    initStatusStack();
    initPosStack();
  }, [editor, currentControlIndex, currentPosIndex]);

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      gap="1vw"
    >
      <TimeControlInput />

      <FrameControlInput
        label="control frame"
        value={currentControlIndex}
        placeholder="status index"
        handleChange={handleChangeControlFrame}
      />

      <FrameControlInput
        label="position frame"
        value={currentPosIndex}
        placeholder="position index"
        handleChange={handleChangePosFrame}
      />
    </Stack>
  );
}
