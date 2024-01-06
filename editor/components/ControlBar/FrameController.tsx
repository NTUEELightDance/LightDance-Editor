import { useEffect } from "react";
import FrameControlInput from "./FrameControlInput";
import TimeControlInput from "./TimeControlInput";

import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import {
  setCurrentControlIndex,
  setCurrentLEDIndex,
  setCurrentPosIndex,
  setCurrentTime,
} from "@/core/actions";
import { initStatusStack, initPosStack } from "@/core/actions";
import useRoute from "@/hooks/useRoute";

import { useHotkeys } from "react-hotkeys-hook";

import { throttle } from "lodash";

const THROTTLE = 100;

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);
  const currentPosIndex = useReactiveVar(reactiveState.currentPosIndex);
  const currentLEDIndex = useReactiveVar(reactiveState.currentLEDIndex);
  const editor = useReactiveVar(reactiveState.editor);
  const { page } = useRoute();

  const handleChangeControlFrame = (value: number) => {
    setCurrentControlIndex({ payload: value });
  };

  const handleChangePosFrame = (value: number) => {
    setCurrentPosIndex({ payload: value });
  };

  const handleChangeLEDFrame = (value: number) => {
    setCurrentLEDIndex({ payload: value });
  };

  const timeShift = (time: number) => {
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
      timeShift(100);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+left",
    throttle(() => {
      timeShift(-500);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+right",
    throttle(() => {
      timeShift(500);
    }, THROTTLE)
  );

  useHotkeys(
    "down",
    throttle(() => {
      if (editor === "CONTROL_EDITOR") {
        setCurrentControlIndex({
          payload: currentControlIndex + 1,
        });
      } else if (editor === "POS_EDITOR") {
        setCurrentPosIndex({
          payload: currentPosIndex + 1,
        });
      }
    }, THROTTLE),
    [currentControlIndex, currentPosIndex]
  );
  useHotkeys(
    "up",
    throttle(() => {
      if (editor === "CONTROL_EDITOR") {
        setCurrentControlIndex({
          payload: currentControlIndex - 1,
        });
      } else if (editor === "POS_EDITOR") {
        setCurrentPosIndex({
          payload: currentPosIndex - 1,
        });
      }
    }, THROTTLE),
    [editor, currentControlIndex, currentPosIndex]
  );

  useEffect(() => {
    initStatusStack();
    initPosStack();
  }, [editor, currentControlIndex, currentPosIndex]);

  return (
    <>
      <TimeControlInput />
      {(editor === "CONTROL_EDITOR" || page === "COMMAND_CENTER") && (
        <FrameControlInput
          label="control frame"
          value={currentControlIndex}
          placeholder="status index"
          handleChange={handleChangeControlFrame}
        />
      )}
      {(editor === "POS_EDITOR" || page === "COMMAND_CENTER") && (
        <FrameControlInput
          label="position frame"
          value={currentPosIndex}
          placeholder="position index"
          handleChange={handleChangePosFrame}
        />
      )}
      {editor === "LED_EDITOR" && page === "EDITOR" && (
        <FrameControlInput
          label="LED frame"
          value={currentLEDIndex}
          placeholder="LED index"
          handleChange={handleChangeLEDFrame}
        />
      )}
    </>
  );
}
