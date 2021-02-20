import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// redux selector and actions
import {
  selectGlobal,
  toggleMode,
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
    dispatch(toggleMode(m));
  };
  const handleSave = () => {
    dispatch(saveCurrentStatus());
  };
  const handleDelete = () => {
    if (window.confirm(`Are you sure to delete ?`))
      dispatch(deleteCurrentStatus());
  };
  // keyDown to change mode (include multiple keyDown)
  const handleKeyDown = (e) => {
    if (e.code === "KeyE") handleChangeMode(EDIT);
    else if (e.code === "KeyA") handleChangeMode(ADD);
    else if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.code === "Delete") handleDelete();
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
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
          color="primary"
          disabled={mode === IDLE}
          onClick={handleSave}
        >
          SAVE
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={handleDelete}
          disabled={mode !== IDLE}
        >
          DEL
        </Button>
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
