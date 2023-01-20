// mui
import { Stack } from "@mui/material";
import FrameControlInput from "./FrameControlInput";
import TimeControlInput from "./TimeControlInput";

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
import { setCurrentControlIndex, setCurrentPosIndex } from "../../core/actions";

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

  const handleChange = (setValue: (arg0: any) => void) => {
    return (value: number) => {
      setValue({ payload: value });
    };
  };
  const handleChangeControlFrame = handleChange(setCurrentControlIndex);
  const handleChangePosFrame = handleChange(setCurrentPosIndex);

  const editor = useReactiveVar(reactiveState.editor);
  useHotkeys(
    "right, w",
    () => {
      if (editor === CONTROL_EDITOR) {
        handleChangeControlFrame(currentControlIndex + 1);
      } else handleChangePosFrame(currentPosIndex + 1);
    },
    [editor, currentControlIndex, currentPosIndex]
  );
  useHotkeys(
    "left, q",
    () => {
      if (editor === CONTROL_EDITOR) {
        handleChangeControlFrame(currentControlIndex - 1);
      } else handleChangePosFrame(currentPosIndex - 1);
    },
    [editor, currentControlIndex, currentPosIndex]
  );

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
