import React, { useState } from "react";
import { useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// redux selector and actions
import {
  saveCurrentStatus,
  deleteCurrentStatus,
  saveCurrentFade,
} from "../../slices/globalSlice";
// components
import SelectDancer from "./SelectDancer";
import ElEditor from "./ElEditor";
import LedEditor from "./LedEditor";
import ModeSelector from "../ModeSelector";
import Fade from "./Fade";
// constants

import store from "../../store";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
  },
  selectDancer: {
    position: "fixed",
  },
  switches: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grow: {
    flexGrow: 1,
  },
  fixed: {
    position: "fixed",
  },
}));

/**
 * LightEditor
 */
export default function LightEditor() {
  // styles
  const classes = useStyles();
  // redux
  const dispatch = useDispatch();

  // switch between ElEditor and LedEditor
  const ELEDITOR = "EL Editor";
  const LEDEDITOR = "Led Editor";
  const [editor, setEditor] = useState(ELEDITOR);
  const handleChangeEditor = () => {
    setEditor(editor === ELEDITOR ? LEDEDITOR : ELEDITOR);
  };

  // save
  const handleSave = () => {
    const status = store.getState().global.currentStatus;
    const { controlFrame, time } = store.getState().global.timeData;
    dispatch(saveCurrentStatus({ status, frame: controlFrame, time }));
    dispatch(saveCurrentFade());
  };
  // delete
  const handleDelete = () => {
    if (window.confirm(`Are you sure to delete ?`)) {
      dispatch(deleteCurrentStatus());
    }
  };

  // TODO: make ModeSelector and  selectDancer fixed position
  return (
    <div id="editor" className={classes.root}>
      <div>
        <ModeSelector handleSave={handleSave} handleDelete={handleDelete} />
        <SelectDancer className={classes.selectDancer} />
      </div>
      <div className={classes.grow}>
        <div>
          <div className={classes.switches}>
            <Button variant="text" onClick={handleChangeEditor}>
              {editor}
            </Button>
            <Fade />
          </div>
          {editor === ELEDITOR ? <ElEditor /> : <LedEditor />}
        </div>
      </div>
    </div>
  );
}
