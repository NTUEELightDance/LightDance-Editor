import { useEffect } from "react";
import PropTypes from "prop-types";
// mui
import Button from "@material-ui/core/Button";
// actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { toggleMode, saveToLocal } from "core/actions";
// constants
import {
  IDLE,
  CONTROL_ADD,
  CONTROL_EDIT,
  POS_ADD,
  POS_EDIT,
} from "../../../constants";

export default function ModeSelector({ handleSave, handleDelete }) {
  // redux states
  const mode = useReactiveVar(reactiveState.mode);

  // mode
  const handleChangeMode = (m: number) => {
    toggleMode({ payload: m });
  };

  const handleSaveToLocal = () => {
    saveToLocal();
  };

  // keyDown to change mode (include multiple keyDown)
  const handleKeyDown = (e) => {
    if (e.code === "KeyE") handleChangeMode(CONTROL_EDIT);
    else if (e.code === "KeyA") handleChangeMode(CONTROL_ADD);
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
        color={mode === CONTROL_EDIT ? "secondary" : "default"}
        onClick={() => handleChangeMode(CONTROL_EDIT)}
      >
        {mode === CONTROL_EDIT ? "Cancel" : "EDIT"}
      </Button>
      <Button
        variant="outlined"
        size="small"
        color={mode === CONTROL_ADD ? "secondary" : "default"}
        onClick={() => handleChangeMode(CONTROL_ADD)}
      >
        {mode === CONTROL_ADD ? "Cancel" : "ADD"}
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
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={handleSaveToLocal}
        disabled={false}
      >
        SAVE_LOCAL
      </Button>
    </div>
  );
}

ModeSelector.propTypes = {
  handleSave: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};
