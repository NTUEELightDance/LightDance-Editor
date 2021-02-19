import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// redux selector and actions
import {
  selectGlobal,
  setMode,
  saveCurrentStatus,
  deleteCurrentStatus,
} from "../../slices/globalSlice";
// components
import SelectDancer from "./selectDancer";
import SlidebarList from "./slidebarList";
// constants
import { IDLE, ADD, EDIT } from "../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "28vw",
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
  },
  selectDancer: {
    position: "fixed",
  },
  grow: {
    flexGrow: 1,
  },
}));

export default function Editor() {
  // styles
  const classes = useStyles();
  // redux states
  const { mode } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  // mode
  const handleChangeMode = (m) => {
    if (m === mode) dispatch(setMode(IDLE));
    else dispatch(setMode(m));
  };
  const handleSave = () => {
    dispatch(saveCurrentStatus());
  };
  const handleDelete = () => {
    dispatch(deleteCurrentStatus());
  };

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <div id="editor" className={classes.root}>
      <div>
        <div>
          <Button
            variant="outlined"
            size="small"
            style={{
              backgroundColor: mode === EDIT ? "#505050" : "",
            }}
            onClick={() => handleChangeMode(EDIT)}
          >
            EDIT
          </Button>
          <Button
            variant="outlined"
            size="small"
            style={{
              backgroundColor: mode === ADD ? "#505050" : "",
            }}
            onClick={() => handleChangeMode(ADD)}
          >
            ADD
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={mode === IDLE}
            onClick={handleSave}
          >
            SAVE
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="default"
            onClick={handleDelete}
            disabled={mode !== IDLE}
          >
            DEL
          </Button>
        </div>
      </div>
      <SelectDancer className={classes.selectDancer} />
      <div className={classes.grow}>
        <Scrollbars renderThumbVertical={renderThumb}>
          <SlidebarList />
        </Scrollbars>
      </div>
      {/* TODO: led slider, selection  */}
    </div>
  );
}
