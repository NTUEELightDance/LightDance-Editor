import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
// action and selector
import { selectGlobal, setPresets, addPresets } from "../../slices/globalSlice";
import { selectLoad } from "../../slices/loadSlice";
// utils
import { getItem } from "../../utils/localStorage";
// components
import PresetsList from "./presetsList";

/**
 * This is Presets component, list of status
 * @component
 */
export default function Presets() {
  const dispatch = useDispatch();
  // presets intialize
  // get loadedPresets or storagePresets
  const { presets: loadedPresets } = useSelector(selectLoad);
  const { presets } = useSelector(selectGlobal);
  useEffect(() => {
    if (getItem("presets")) {
      dispatch(setPresets(JSON.parse(getItem("presets"))));
    } else {
      dispatch(setPresets(loadedPresets));
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
    if (name.trim() !== "") dispatch(addPresets(name));
    closeDialog();
  };

  // short cut of key to save currentStatus
  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button variant="outlined" size="small" onClick={openDialog}>
          Add
        </Button>
        <PresetsList presets={presets} />
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
