import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// redux selector and actions
import { selectGlobal, toggleMode } from "../../slices/globalSlice";
// constants
import { IDLE, ADD, EDIT } from "../../constants";

export default function ModeSelector({ handleSave, handleDelete }) {
  // redux states
  const { mode } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  // mode
  const handleChangeMode = (m) => {
    dispatch(toggleMode(m));
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
  return (
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
  );
}
