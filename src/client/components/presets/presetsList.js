import React, { useState } from "react";
import PropTypes from "prop-types";
// redux
import { useDispatch } from "react-redux";
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
// action and selector
import {
  setCurrentStatus,
  editPresetsName,
  deletePresets,
} from "../../slices/globalSlice";

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
export default function PresetsList({ presets }) {
  const classes = useStyles();
  const dispatch = useDispatch();

  // dialog
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [presetId, setPresetId] = useState(0);
  const openDialog = (name, id) => {
    setNameVal(name);
    setPresetId(id);
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    setNameVal("");
  };
  const handleChangeName = (e) => setNameVal(e.target.value);

  // dispatch
  const handleEditPresets = (name, idx) => {
    dispatch(editPresetsName({ name, idx }));
    closeDialog();
  };
  const handleDeletePresets = (idx) => {
    dispatch(deletePresets(idx));
  };
  const handleSetCurrentStatus = (status) => {
    dispatch(setCurrentStatus(status));
  };

  return (
    <div>
      <List>
        {presets.map(({ name, status }, i) => (
          <ListItem
            key={`${i}_preset`}
            className={classes.flex}
            onDoubleClick={() => handleSetCurrentStatus(status)}
          >
            <div className={classes.grow}>
              <Typography variant="body1">
                [{i}] {name}
              </Typography>
            </div>
            <div>
              <IconButton
                className={classes.btn}
                onClick={() => openDialog(name, i)}
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
        ))}
        <Dialog fullWidth size="md" open={open} onClose={closeDialog}>
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
