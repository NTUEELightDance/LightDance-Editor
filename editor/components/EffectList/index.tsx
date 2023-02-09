import React, { useState } from "react";
import { addEffect, applyEffect, deleteEffect } from "core/actions";
import { confirmation } from "core/utils";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import useEffectList from "hooks/useEffectList";
import useTimeInput from "hooks/useTimeInput";

// mui materials
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  //InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EffectList() {
  const { effectList } = useEffectList();
  const currentTime = useReactiveVar(reactiveState.currentTime);

  const [newEffectName, setNewEffectName] = useState<string>("");
  const [newEffectFrom, setNewEffectFrom] = useState<number>(0);
  const [newEffectTo, setNewEffectTo] = useState<number>(0);
  const {
    textFieldProps: fromTextFieldProps,
    timeError: fromTimeError,
    timeInputRef: fromTimeInputRef,
  } = useTimeInput([
    newEffectFrom,
    (newTime: number) => {
      setNewEffectFrom(newTime);
    },
  ]);
  const {
    textFieldProps: toTextFieldProps,
    timeError: toTimeError,
    timeInputRef: toTimeInputRef,
  } = useTimeInput([
    newEffectTo,
    (newTime: number) => {
      setNewEffectTo(newTime);
    },
  ]);

  const [effectSelectedID, setEffectSelectedID] = useState<string>("");
  const [effectSelectedName, setEffectSelectedName] = useState<string>("");
  const [collidedFrame, setCollidedFrame] = useState<number[]>([]);
  const [applyOpened, setApplyOpened] = useState<boolean>(false); // open apply effect dialog
  const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog
  const [addOpened, setAddOpened] = useState<boolean>(false); // open add effect dialog
  const [previewOpened, setPreviewOpened] = useState<boolean>(false);
  const [previewing] = useState<boolean>(false);

  const handleOpenApply = (id: string, name: string) => {
    setEffectSelectedID(id);
    setEffectSelectedName(name);
    setApplyOpened(true);
  };

  const handleCloseApply = () => {
    setApplyOpened(false);
    setEffectSelectedID("");
    setEffectSelectedName("");
    setCollidedFrame([]);
  };

  const handleApplyEffect = async () => {
    const ok = await confirmation.warning(
      `This will clear all frames from ${currentTime} to the end of the effect. Are you sure?`
    );

    if (ok) {
      applyEffect({
        payload: { start: currentTime, applyId: effectSelectedID },
      });
    }

    handleCloseApply();
  };

  const handleOpenDelete = (id: string, name: string) => {
    setEffectSelectedID(id);
    setEffectSelectedName(name);
    setDeleteOpened(true);
  };
  const handleCloseDelete = () => {
    setDeleteOpened(false);
    setEffectSelectedID("");
    setEffectSelectedName("");
  };
  const handleDeleteEffect = () => {
    deleteEffect({ payload: effectSelectedID });
    handleCloseDelete();
  };

  const handleOpenAdd = () => {
    setAddOpened(true);
    setNewEffectName("");
    setNewEffectFrom(0);
    setNewEffectTo(0);
  };
  const handleCloseAdd = () => {
    setAddOpened(false);
  };
  const handleAddEffect = async () => {
    addEffect({
      payload: {
        effectName: newEffectName,
        startTime: newEffectFrom || 0,
        endTime: newEffectTo || 0,
      },
    });
    handleCloseAdd();
    // setPreviewOpened(true);
  };

  return (
    <div>
      <List>
        {effectList.map((effect) => (
          <React.Fragment key={effect.id}>
            <React.Fragment>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Apply Effect" arrow placement="top">
                      <IconButton
                        edge="end"
                        aria-label="apply"
                        size="large"
                        onClick={() => {
                          handleOpenApply(
                            effect.id.toString(),
                            effect.description
                          );
                        }}
                      >
                        <AddIcon fontSize="inherit" sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Effect" arrow placement="top">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="large"
                        onClick={() => {
                          handleOpenDelete(
                            effect.id.toString(),
                            effect.description
                          );
                        }}
                      >
                        <DeleteIcon
                          fontSize="inherit"
                          sx={{ color: "white" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "20px", color: "white" }}>
                      {effect.description}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        sx={{ fontSize: "10px", color: "white" }}
                      >
                        {"- ControlFrame Length: "}
                        {effect.controlFrames
                          ? Object.keys(effect.controlFrames).length
                          : 0}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        sx={{ fontSize: "10px", color: "white" }}
                      >
                        {"- PosFrame Length: "}
                        {effect.positionFrames
                          ? Object.keys(effect.positionFrames).length
                          : 0}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
            <Divider
              component="li"
              sx={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
            />
          </React.Fragment>
        ))}
        <Grid
          container
          justifyContent="center"
          sx={{
            width: "100%",
            minHeight: "80px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Custom
          </Button>
        </Grid>
      </List>
      <Dialog open={applyOpened}>
        <DialogTitle>Apply Effect to Current Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* This will insert {effectRecordMap[effectSelected] ? effectRecordMap[effectSelected].length : 0}{" "}
                        frame(s) to current time spot.{" "} */}
            {collidedFrame.length > 0 ? (
              <span>
                The following frame(s) will be collided:
                {collidedFrame?.map((frame) => (
                  <span style={{ color: "#ba000d" }} key={frame}>
                    {frame}
                  </span>
                ))}
              </span>
            ) : (
              ""
            )}
            <br />
            Are you sure to apply effect "{effectSelectedName}" to current
            record?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApply}>Cancel</Button>
          <Button autoFocus onClick={handleApplyEffect}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpened}>
        <DialogTitle>Delete Effect From Effect List</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure to delete effect "{effectSelectedName}" from the effect
            list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button autoFocus onClick={handleDeleteEffect}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addOpened} fullWidth maxWidth="xs">
        <DialogTitle>Add New Effect</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New Effect Name"
            required
            fullWidth
            variant="standard"
            value={newEffectName}
            onChange={(e) => {
              setNewEffectName(e.target.value);
            }}
          />
          {/* <TextField
                        autoFocus
                        type="number"
                        margin="normal"
                        id="name"
                        label="From Frame"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">#</InputAdornment>,
                        }}
                        required
                        variant="standard"
                        sx={{ marginRight: 3.2 }}
                        value={newEffectFrom}
                        helperText={
                            parseInt(newEffectFrom) < 0 || parseInt(newEffectFrom) >= controlRecord.length
                                ? "No such frame"
                                : ""
                        }
                        error={
                            parseInt(newEffectFrom) < 0 ||
                            parseInt(newEffectFrom) >= controlRecord.length ||
                            parseInt(newEffectTo) < parseInt(newEffectFrom)
                        }
                        onChange={(e) => setNewEffectFrom(e.target.value)}
                    /> */}

          {/* <TextField
                        type="number"
                        margin="normal"
                        id="name"
                        label="To Frame"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">#</InputAdornment>,
                        }}
                        required
                        variant="standard"
                        value={newEffectTo}
                        helperText={
                            parseInt(newEffectTo) < 0 || parseInt(newEffectTo) >= controlRecord.length
                                ? "No such frame"
                                : ""
                        }
                        error={
                            parseInt(newEffectTo) < 0 ||
                            parseInt(newEffectTo) >= controlRecord.length ||
                            parseInt(newEffectTo) < parseInt(newEffectFrom)
                        }
                        onChange={(e) => setNewEffectTo(e.target.value)}
                    /> */}
          <TextField
            margin="normal"
            id="name"
            label="From Time:"
            {...fromTextFieldProps}
            sx={{ width: "20em", marginRight: 2 }}
            variant="outlined"
            error={fromTimeError}
            required
          />
          <TextField
            margin="normal"
            id="name"
            label="To Time:"
            {...toTextFieldProps}
            sx={{ width: "20em", marginRight: 2 }}
            variant="outlined"
            error={toTimeError || newEffectTo < newEffectFrom}
            required
            helperText={
              newEffectTo < newEffectFrom ? "Cannot be smaller than from" : ""
            }
          />
          {(toTimeError || fromTimeError) && (
            <Popper
              open={toTimeError || fromTimeError}
              anchorEl={
                toTimeError ? toTimeInputRef.current : fromTimeInputRef.current
              }
            >
              <Paper>
                <Typography sx={{ p: "0.5em 1em" }}>
                  this is an invalid time
                </Typography>
              </Paper>
            </Popper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button
            onClick={handleAddEffect}
            disabled={!newEffectName || newEffectTo < newEffectFrom}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={previewOpened} fullWidth maxWidth="md">
        <DialogTitle>Preview Effect</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPreviewOpened(false);
            }}
          >
            Cancel
          </Button>
          <Button
            autoFocus
            onClick={() => {
              setPreviewOpened(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={previewing}
        message="[ADD EFFECT] Previewing your new effect..."
        key="preview snackbar"
      />
    </div>
  );
}
