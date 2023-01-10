import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// mui
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Input from "@mui/material/Input";
// states and actions
import { setCurrentPos } from "core/actions";
// hooks
import usePosPresets from "./hooks/usePosPresets";
// redux states
import { selectLoad } from "slices/loadSlice";
// utils
import { getItem } from "core/utils";
// components
import PresetsList from "./PresetsList";
// types
import { DancerCoordinates } from "core/models";

/**
 * This is Presets component, list of pos
 * @component
 */
export default function PosPresets () {
  // presets intialize
  // get loadedPresets or storagePresets
  const { posPresets: loadedPosPresets } = useSelector(selectLoad);

  const {
    posPresets,
    setPosPresets,
    addPosPresets,
    editPosPresetsName,
    deletePosPresets
  } = usePosPresets();

  useEffect(() => {
    if (getItem("posPresets")) {
      setPosPresets(JSON.parse(getItem("posPresets") || ""));
    } else {
      setPosPresets(loadedPosPresets);
    }
  }, []);

  // dialog
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const openDialog = () => { setOpen(true); };
  const closeDialog = () => {
    setOpen(false);
    setNameVal("");
  };
  const handleChangeName = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setNameVal(e.target.value); };

  // dispatch
  const handleAddPresets = (name: string) => {
    if (name.trim() !== "") addPosPresets(name);
    closeDialog();
  };
  const handleEditPresets = (name: string, idx: number) => {
    editPosPresetsName({ name, idx });
    closeDialog();
  };
  const handleDeletePresets = (idx: number) => {
    deletePosPresets(idx);
  };
  const handleSetCurrentPos = (pos: DancerCoordinates) => {
    setCurrentPos({ payload: pos });
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
        <Dialog maxWidth="md" open={open} onClose={closeDialog}>
          <DialogTitle>Preset name</DialogTitle>
          <DialogContent>
            <Input fullWidth value={nameVal} onChange={handleChangeName} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { handleAddPresets(nameVal); }}>OK</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
