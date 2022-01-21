import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
// action and selector
import {
  selectGlobal,
  setPosPresets,
  addPosPresets,
  setCurrentPos,
  editPosPresetsName,
  deletePosPresets,
} from "../../slices/globalSlice";
import { selectLoad } from "../../slices/loadSlice";
// utils
import { getItem } from "../../utils/localStorage";
// components
import PresetsList from "./presetsList";

/**
 * This is Presets component, list of pos
 * @component
 */
export default function PosPresets() {
  const dispatch = useDispatch();
  // presets intialize
  // get loadedPresets or storagePresets
  const { posPresets: loadedPosPresets } = useSelector(selectLoad);
  const { posPresets } = useSelector(selectGlobal);
  useEffect(() => {
    if (getItem("posPresets")) {
      dispatch(setPosPresets(JSON.parse(getItem("posPresets"))));
    } else {
      dispatch(setPosPresets(loadedPosPresets));
    }
  }, []);

  // dialog
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const openDialog = () => setOpen(true);
  const closeDialog = () => {
    setOpen(false);
    setNameVal("");
  };
  const handleChangeName = (e) => setNameVal(e.target.value);

  // dispatch
  const handleAddPresets = (name) => {
    if (name.trim() !== "") dispatch(addPosPresets(name));
    closeDialog();
  };
  const handleEditPresets = (name, idx) => {
    dispatch(editPosPresetsName({ name, idx }));
    closeDialog();
  };
  const handleDeletePresets = (idx) => {
    dispatch(deletePosPresets(idx));
  };
  const handleSetCurrentPos = (pos) => {
    dispatch(setCurrentPos(pos));
  };

  // short cut of key to save currentPos
  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button variant="outlined" size="small" onClick={openDialog}>
          Add
        </Button>
        <PresetsList
          presets={posPresets}
          handleEditPresets={handleEditPresets}
          handleDeletePresets={handleDeletePresets}
          handleSetCurrent={handleSetCurrentPos}
        />
      </div>
      <div>
        <Dialog fullWidth size="md" open={open} onClose={closeDialog}>
          <DialogTitle>Preset name</DialogTitle>
          <DialogContent>
            <TextField fullWidth value={nameVal} onChange={handleChangeName} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleAddPresets(nameVal)}>OK</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
