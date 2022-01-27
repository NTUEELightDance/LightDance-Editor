import React from "react";
import clsx from "clsx";
// redux
import { useSelector, useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@mui/system";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";

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

const useStyles = makeStyles((theme: Theme) => ({
  flex: {
    display: "flex",
    alignItems: "center",
  },
  frameBtn: {
    height: "100%",
  },
  marginTB: {
    marginTop: theme.spacing(1),
    marginButton: theme.spacing(1),
  },
  marginLR: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  input: {
    width: "120px",
  },
}));

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  // styles
  const classes = useStyles();
  // redux
  const dispatch = useDispatch();
  const {
    timeData: { time, controlFrame, posFrame },
  } = useSelector(selectGlobal);

  // constant
  const from = TIMECONTROLLER;
  // handle Change
  const handleChangeTime = (value: number) => {
    dispatch(
      setTime({
        from,
        time: value,
      })
    );
  };
  const handleChangeControlFrame = (value: number) => {
    dispatch(
      setControlFrame({
        from,
        controlFrame: value,
      })
    );
  };
  const handleChangePosFrame = (value: number) => {
    dispatch(
      setPosFrame({
        from,
        posFrame: value,
      })
    );
  };

  return (
    <div className={classes.flex}>
      <div className={clsx(classes.flex, classes.marginLR)}>
        <Typography variant="body1" color="initial">
          time:{" "}
        </Typography>
        <TextField
          className={classes.input}
          size="small"
          margin="none"
          variant="outlined"
          type="number"
          placeholder="time"
          value={time}
          inputProps={{ min: 0 }}
          onChange={(e) => handleChangeTime(parseInt(e.target.value, 10))}
        />
      </div>
      <div className={clsx(classes.flex, classes.marginLR)}>
        <Typography variant="body1" color="initial">
          controlFrame:
        </Typography>
        <div className={classes.flex}>
          <IconButton
            className={classes.frameBtn}
            onClick={() => handleChangeControlFrame(controlFrame - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <TextField
            className={classes.input}
            size="small"
            margin="none"
            variant="outlined"
            type="number"
            placeholder="status index"
            value={controlFrame}
            inputProps={{ min: 0 }}
            onChange={(e) => handleChangeControlFrame(parseInt(e.target.value, 10))}
          />
          <IconButton
            className={classes.frameBtn}
            onClick={() => handleChangeControlFrame(controlFrame + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
      <div className={clsx(classes.flex, classes.marginLR)}>
        <Typography variant="body1" color="initial">
          posFrame:
        </Typography>
        <div className={classes.flex}>
          <IconButton
            className={classes.frameBtn}
            onClick={() => handleChangePosFrame(posFrame - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <TextField
            className={classes.input}
            size="small"
            margin="none"
            variant="outlined"
            type="number"
            placeholder="position index"
            value={posFrame}
            inputProps={{ min: 0 }}
            onChange={(e) => handleChangePosFrame(parseInt(e.target.value, 10))}
          />
          <IconButton
            className={classes.frameBtn}
            onClick={() => handleChangePosFrame(posFrame + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
