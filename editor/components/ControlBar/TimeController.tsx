// mui
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Stack } from "@mui/material";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// constant
import { TIMECONTROLLER } from "../../constants";
// type
import TimeControlInput from "./TimeControlInput";

// reactive state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
import { setTime, setControlFrame, setPosFrame } from "../../core/actions";

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  const { time, controlFrame, posFrame } = useReactiveVar(
    reactiveState.timeData
  );

  const handleChange = (setValue: (arg0: any) => void, valueName: string) => {
    return async (value: number) => {
      await setValue({
        payload: {
          from: TIMECONTROLLER,
          [valueName]: parseInt(value, 10),
        },
      });
    };
  };

  const handleChangeTime = handleChange(setTime, "time");

  const handleChangeControlFrame = handleChange(
    setControlFrame,
    "controlFrame"
  );
  const handleChangePosFrame = handleChange(setPosFrame, "posFrame");

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
        value={time}
        placeholder="time"
        handleChange={handleChangeTime}
      />

      <Typography variant="body1" color="initial" style={{ marginLeft: "1em" }}>
        control frame:
      </Typography>
      <IconButton onClick={() => handleChangeControlFrame(controlFrame - 1)}>
        <ChevronLeftIcon />
      </IconButton>
      <TimeControlInput
        value={controlFrame}
        placeholder="status index"
        handleChange={handleChangeControlFrame}
      />
      <IconButton onClick={() => handleChangeControlFrame(controlFrame + 1)}>
        <ChevronRightIcon />
      </IconButton>

      <Typography variant="body1" color="initial">
        position frame:
      </Typography>
      <IconButton onClick={() => handleChangePosFrame(posFrame - 1)}>
        <ChevronLeftIcon />
      </IconButton>

      <TimeControlInput
        value={posFrame}
        placeholder="position index"
        handleChange={handleChangePosFrame}
      />
      <IconButton onClick={() => handleChangePosFrame(posFrame + 1)}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
