import React, { useState } from "react";
// mui
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// types
import {
  PresetsListType,
  LightPresetsElement,
  PosPresetsElement
} from "./presets";

function InstanceOfLightPresetsElement (
  preset: any
): preset is LightPresetsElement {
  return "status" in preset;
}
function InstanceOfPosPresetsElement (preset: any): preset is PosPresetsElement {
  return "pos" in preset;
}

/**
 * This is Presets List
 * @component
 */
export default function PresetsList ({
  presets,
  handleEditPresets,
  handleDeletePresets,
  handleSetCurrent
}: PresetsListType) {
  // dialog
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [presetId, setPresetId] = useState(0);
  const openDialog = (name: string, id: number) => {
    setNameVal(name);
    setPresetId(id);
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    setNameVal("");
  };
  const handleChangeName = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNameVal(e.target.value);
  };

  const handleApplyPreset = (
    preset: LightPresetsElement | PosPresetsElement
  ) => {
    if (InstanceOfLightPresetsElement(preset)) {
      handleSetCurrent(preset.status);
    } else if (InstanceOfPosPresetsElement(preset)) {
      handleSetCurrent(preset.pos);
    } else {
      console.error("Not a valid lightPreset or posPreset.");
    }
  };

  return (
    <div>
      <List>
        {presets.map(
          (preset: LightPresetsElement | PosPresetsElement, i: number) => (
            <ListItem
              key={`${i}_preset`}
              sx={{ display: "flex" }}
              onDoubleClick={() => { handleApplyPreset(preset); }}
            >
              <div style={{ flexGrow: 1 }}>
                <Typography variant="body1">
                  [{i}] {preset.name}
                </Typography>
              </div>
              <div>
                <IconButton
                  sx={{ p: 0 }}
                  onClick={() => { openDialog(preset.name, i); }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => { handleDeletePresets(i); }}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </ListItem>
          )
        )}
        <Dialog fullWidth maxWidth="md" open={open} onClose={closeDialog}>
          <DialogTitle>Preset name</DialogTitle>
          <DialogContent>
            <TextField fullWidth value={nameVal} onChange={handleChangeName} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { handleEditPresets(nameVal, presetId); }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </List>
    </div>
  );
}
