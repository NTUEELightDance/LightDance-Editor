import React, { useState } from "react";
import { useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// redux selector and actions
import {
  saveCurrentStatus,
  deleteCurrentStatus,
} from "../../slices/globalSlice";
// components
import SelectDancer from "./selectDancer";
import ElEditor from "./el";
import LedEditor from "./led";
import ModeSelector from "../modeSelector";
// constants

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
  const ELEDITOR = "EL Editor",
    LEDEDITOR = "Led Editor";
  const [editor, setEditor] = useState(ELEDITOR);
  const handleChangeEditor = () => {
    setEditor(editor === ELEDITOR ? LEDEDITOR : ELEDITOR);
  };

  // save
  const handleSave = () => {
    dispatch(saveCurrentStatus());
  };
  // delete
  const handleDelete = () => {
    if (window.confirm(`Are you sure to delete ?`)) {
      dispatch(deleteCurrentStatus());
    }
  };

  // TODO: make ModeSelector and e selectDancer fixed
  return (
    <div id="editor" className={classes.root}>
      <div>
        <ModeSelector handleSave={handleSave} handleDelete={handleDelete} />
        <SelectDancer className={classes.selectDancer} />
      </div>
      <div className={classes.grow}>
        <div>
          <Button variant="text" onClick={handleChangeEditor}>
            {editor}
          </Button>
          {editor === ELEDITOR ? <ElEditor /> : <LedEditor />}
        </div>
      </div>
    </div>
  );
}
