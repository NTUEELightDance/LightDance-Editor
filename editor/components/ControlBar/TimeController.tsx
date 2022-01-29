// redux
import { useSelector, useDispatch } from "react-redux";
// mui
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Stack } from "@mui/material";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// actions and selector
import {
  selectGlobal,
  setTime,
  setPosFrame,
  setControlFrame,
} from "../../slices/globalSlice";
// constant
import { TIMECONTROLLER } from "../../constants";

import TimeControlInput from "./TimeControlInput";

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  // redux
  const dispatch = useDispatch();
  const {
    timeData: { time, controlFrame, posFrame },
  } = useSelector(selectGlobal);

  const handleChange = (setValue: (arg0: any) => void, valueName: string) => {
    return (value: number) => {
      dispatch(
        setValue({
          from: TIMECONTROLLER,
          [valueName]: value,
        })
      );
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
