import { useEffect } from "react";
// mui
import { Stack } from "@mui/material";
import FrameControlInput from "./FrameControlInput";
import TimeControlInput from "./TimeControlInput";

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
import { setCurrentControlIndex, setCurrentPosIndex } from "../../core/actions";
import { initStatusStack, initPosStack } from "../../core/actions";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";
// constants
import { CONTROL_EDITOR } from "@/constants";

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);
  const currentPosIndex = useReactiveVar(reactiveState.currentPosIndex);

  const handleChangeControlFrame = (value: number) => {
    setCurrentControlIndex({ payload: value });
  };
  const handleChangePosFrame = (value: number) => {
    setCurrentPosIndex({ payload: value });
  };

  const editor = useReactiveVar(reactiveState.editor);
  useHotkeys(
    "up, w",
    () => {
      if (editor === CONTROL_EDITOR) {
        handleChangeControlFrame(currentControlIndex + 1);
      } else handleChangePosFrame(currentPosIndex + 1);
    },
    [editor, currentControlIndex, currentPosIndex]
  );
  useHotkeys(
    "down, s",
    () => {
      if (editor === CONTROL_EDITOR) {
        handleChangeControlFrame(currentControlIndex - 1);
      } else handleChangePosFrame(currentPosIndex - 1);
    },
    [editor, currentControlIndex, currentPosIndex]
  );

  useEffect(() => {
    // renew statusStack and posStack
    initStatusStack();
    initPosStack();
  }, [currentControlIndex, currentPosIndex]);

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
