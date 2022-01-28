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
  setLightPresets,
  addLightPresets,
  setCurrentStatus,
  editLightPresetsName,
  deleteLightPresets,
} from "../../slices/globalSlice";
import { selectLoad } from "../../slices/loadSlice";
// utils
import { getItem } from "../../utils/localStorage";
// components
import PresetsList from "./PresetsList";
import { string } from "prop-types";
//types
import { ControlMapStatus } from "types/globalSlice";

/**
 * This is Presets component, list of status
 * @component
 */
export default function LightPresets() {
  const dispatch = useDispatch();
  // presets intialize
  // get loadedPresets or storagePresets
  const { lightPresets: loadedLightPresets } = useSelector(selectLoad);
  const { lightPresets } = useSelector(selectGlobal);
  useEffect(() => {
    if (getItem("lightPresets")) {
      dispatch(setLightPresets(JSON.parse(getItem("lightPresets") || "")));
    } else {
      dispatch(setLightPresets(loadedLightPresets));
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
  const handleChangeName = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setNameVal(e.target.value);

  // dispatch
  const handleAddPresets = (name: string) => {
    if (name.trim() !== "") dispatch(addLightPresets(name));
    closeDialog();
  };
  const handleEditPresets = (name: string, idx: number) => {
    dispatch(editLightPresetsName({ name, idx }));
    closeDialog();
  };
  const handleDeletePresets = (idx: number) => {
    dispatch(deleteLightPresets(idx));
  };
  const handleSetCurrentStatus = (status: ControlMapStatus) => {
    dispatch(setCurrentStatus(status));
  };

  // short cut of key to save currentStatus
  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button variant="outlined" size="small" onClick={openDialog}>
          Add
        </Button>
        <PresetsList
          presets={lightPresets}
          handleEditPresets={handleEditPresets}
          handleDeletePresets={handleDeletePresets}
          handleSetCurrent={handleSetCurrentStatus}
        />
      </div>
      <div>
        <Dialog fullWidth maxWidth="md" open={open} onClose={closeDialog}>
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
