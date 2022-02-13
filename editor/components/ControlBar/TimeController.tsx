// mui
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Stack } from "@mui/material";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// type
import TimeControlInput from "./TimeControlInput";

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
import {
  setCurrentTime,
  setCurrentControlIndex,
  setCurrentPosIndex,
} from "../../core/actions";

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  const currentTime = useReactiveVar(reactiveState.currentTime);
  const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);
  const currentPosIndex = useReactiveVar(reactiveState.currentPosIndex);

  const handleChange = (setValue: (arg0: any) => void) => {
    return async (value: number) => {
      await setValue({
        payload: parseInt(value, 10),
      });
    };
  };

  const handleChangeTime = handleChange(setCurrentTime);

  const handleChangeControlFrame = handleChange(setCurrentControlIndex);
  const handleChangePosFrame = handleChange(setCurrentPosIndex);

  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
      <Typography
        variant="body1"
        color="initial"
        style={{ marginRight: "1em" }}
      >
        time:
      </Typography>
      <TimeControlInput
        value={currentTime}
        placeholder="time"
        handleChange={handleChangeTime}
      />

      <Typography variant="body1" color="initial" style={{ marginLeft: "1em" }}>
        control frame:
      </Typography>
      <IconButton
        onClick={() => handleChangeControlFrame(currentControlIndex - 1)}
      >
        <ChevronLeftIcon />
      </IconButton>
      <TimeControlInput
        value={currentControlIndex}
        placeholder="status index"
        handleChange={handleChangeControlFrame}
      />
      <IconButton
        onClick={() => handleChangeControlFrame(currentControlIndex + 1)}
      >
        <ChevronRightIcon />
      </IconButton>

      <Typography variant="body1" color="initial">
        position frame:
      </Typography>
      <IconButton onClick={() => handleChangePosFrame(currentPosIndex - 1)}>
        <ChevronLeftIcon />
      </IconButton>

      <TimeControlInput
        value={currentPosIndex}
        placeholder="position index"
        handleChange={handleChangePosFrame}
      />
      <IconButton onClick={() => handleChangePosFrame(currentPosIndex + 1)}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
