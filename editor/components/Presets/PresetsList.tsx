import React, { useState } from "react";
import PropTypes from "prop-types";
// mui
import { makeStyles } from "@material-ui/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
// types
import {
  PresetsListType,
  LightPresetsElement,
  PosPresetsElement,
} from "./presets";

const useStyles = makeStyles({
  flex: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  btn: {
    padding: 0,
  },
});

function InstanceOfLightPresetsElement(
  preset: any
): preset is LightPresetsElement {
  return "status" in preset;
}
function InstanceOfPosPresetsElement(preset: any): preset is PosPresetsElement {
  return "pos" in preset;
}

/**
 * This is Presets List
 * @component
 */
export default function PresetsList({
  presets,
  handleEditPresets,
  handleDeletePresets,
  handleSetCurrent,
}: PresetsListType) {
  const classes = useStyles();

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
              className={classes.flex}
              onDoubleClick={() => handleApplyPreset(preset)}
            >
              <div className={classes.grow}>
                <Typography variant="body1">
                  [{i}] {preset.name}
                </Typography>
              </div>
              <div>
                <IconButton
                  className={classes.btn}
                  onClick={() => openDialog(preset.name, i)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeletePresets(i)}>
                  <DeleteIcon className={classes.btn} />
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
            <Button onClick={() => handleEditPresets(nameVal, presetId)}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </List>
    </div>
  );
}

PresetsList.propTypes = {
  presets: PropTypes.array.isRequired,
};
