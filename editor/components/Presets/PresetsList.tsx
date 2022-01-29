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

//types
import { PresetList, setStatus, setPos } from "types/components/presets";
import { lightPresetsElement, posPresetsElement } from "types/globalSlice";

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

/**
 * This is Presets List
 * @component
 */
export default function PresetsList({
  presets,
  handleEditPresets,
  handleDeletePresets,
  handleSetCurrent,
}: PresetList) {
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
  const handleChangeName = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setNameVal(e.target.value);

  function instanceOflightPresetsElement(
    preset: any
  ): preset is lightPresetsElement {
    return "status" in preset;
  }
  function instanceOfposPresetsElement(
    preset: any
  ): preset is posPresetsElement {
    return "pos" in preset;
  }
  return (
    <div>
      <List>
        {presets.map(
          (preset: lightPresetsElement | posPresetsElement, i: number) => (
            <ListItem
              key={`${i}_preset`}
              className={classes.flex}
              onDoubleClick={() => {
                instanceOflightPresetsElement(preset)
                  ? (handleSetCurrent as setStatus)(preset.status)
                  : instanceOfposPresetsElement(preset)
                  ? (handleSetCurrent as setPos)(preset.pos)
                  : "";
              }}
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
                <IconButton>
                  <DeleteIcon
                    className={classes.btn}
                    onClick={() => handleDeletePresets(i)}
                  />
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
