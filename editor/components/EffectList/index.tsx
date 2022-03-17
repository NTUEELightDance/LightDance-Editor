import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { selectLoad } from "slices/loadSlice";
import {
    addEffect,
    applyEffect,
    deleteEffect,
    getEffectList,
    setCurrentTime,
    setEffectRecordMap,
    setEffectStatusMap,
} from "core/actions";
import { confirmation } from "core/utils";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import useControl from "hooks/useControl";

// import Preview from "./Preview";

// mui materials
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ADD_EFFECT_LIST } from "graphql";

export default function EffectList() {
    const { controlMap, controlRecord } = useControl();
    const currentTime = useReactiveVar(reactiveState.currentTime);
    const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);
    const effectList = useReactiveVar(reactiveState.effectList);

    const [newEffectName, setNewEffectName] = useState<string>("");
    const [newEffectFrom, setNewEffectFrom] = useState<string>("");
    const [newEffectTo, setNewEffectTo] = useState<string>("");
    const [applyEffectClear, setApplyEffectClear] = useState<boolean>(true);
    const [effectSelected, setEffectSelected] = useState<string>("");
    const [collidedFrame, setCollidedFrame] = useState<number[]>([]);
    const [applyOpened, setApplyOpened] = useState<boolean>(false); // open apply effect dialog
    const [deleteOpened, setDeleteOpened] = useState<boolean>(false); // open delete effect dialog
    const [addOpened, setAddOpened] = useState<boolean>(false); // open add effect dialog
    const [previewOpened, setPreviewOpened] = useState<boolean>(false);
    const [previewing, setPreviewing] = useState<boolean>(false);

    const handleOpenApply = (key: string) => {
        setEffectSelected(key);
        setApplyOpened(true);
    };

    const handleCloseApply = () => {
        setApplyOpened(false);
        setEffectSelected("");
        setCollidedFrame([]);
    };
    const handleApplyEffect = async () => {
        const clear = await confirmation.warning("Are you sure to clear all collided frames?");
        const effect = effectList.filter((e) => e.description === effectSelected)[0];
        applyEffect({
            payload: { clear: clear, start: currentControlIndex, applyId: effect.id },
        });
        handleCloseApply();
        getEffectList();
    };

    const handleOpenDelete = (key: string) => {
        setEffectSelected(key);
        setDeleteOpened(true);
    };

    const handleCloseDelete = () => {
        setDeleteOpened(false);
        setEffectSelected("");
    };

    const handleDeleteEffect = () => {
        deleteEffect({ payload: effectSelected });
        handleCloseDelete();
        getEffectList();
    };

    const handleOpenAdd = () => {
        setAddOpened(true);
        setNewEffectName("");
        setNewEffectFrom("");
        setNewEffectTo("");
    };

    const handleCloseAdd = () => {
        setAddOpened(false);
    };

    const handleAddEffect = async () => {
        addEffect({
            payload: {
                effectName: newEffectName,
                startIndex: parseInt(newEffectFrom),
                endIndex: parseInt(newEffectTo) + 1,
            },
        });
        handleCloseAdd();
        // setPreviewOpened(true);
        getEffectList();
    };

    useEffect(() => {
        getEffectList();
    }, []);

    return (
        <div>
            <List>
                {effectList?.map((effect) => (
                    <>
                        <React.Fragment key={effect?.description}>
                            <ListItem
                                secondaryAction={
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Apply Effect" arrow placement="top">
                                            <IconButton
                                                edge="end"
                                                aria-label="apply"
                                                size="large"
                                                onClick={() => handleOpenApply(effect?.description)}
                                            >
                                                <AddIcon fontSize="inherit" sx={{ color: "white" }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Effect" arrow placement="top">
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                size="large"
                                                onClick={() => handleOpenDelete(effect?.description)}
                                            >
                                                <DeleteIcon fontSize="inherit" sx={{ color: "white" }} />
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
                                            <Typography sx={{ fontSize: "10px", color: "white" }}>
                                                ControlFrame Length:{" "}
                                                {/* {effect ? Object.keys(effect.data.control).length : 0} */}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px", color: "white" }}>
                                                {/* PosFrame Length: {effect ? Object.keys(effect.data.position).length : 0} */}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        </React.Fragment>
                        <Divider component="li" sx={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }} />
                    </>
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
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                        Custom
                    </Button>
                </Grid>
            </List>
            <Dialog open={applyOpened}>
                <DialogTitle>Apply Effect to Current Record</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {/* <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Clear"
                            value={applyEffectClear ? "Yes" : "No"}
                            onChange={(e) => setApplyEffectClear(e.target.value === "Yes" ? true : false)}
                            SelectProps={{
                                native: true,
                            }}
                            helperText="Please select to clear the collided frames after apply effect or not."
                        >
                            <option key="Yes" value="Yes">
                                Yes
                            </option>
                            <option key="No" value="No">
                                No
                            </option>
                        </TextField> */}
                        {/* This will insert {effectRecordMap[effectSelected] ? effectRecordMap[effectSelected].length : 0}{" "}
                        frame(s) to current time spot.{" "} */}
                        {collidedFrame.length ? (
                            <span>
                                The following frame(s) will be collided:
                                {collidedFrame?.map((frame) => (
                                    <span style={{ color: "#ba000d" }}> {frame}</span>
                                ))}
                            </span>
                        ) : (
                            ""
                        )}
                        <br />
                        Are you sure to apply effect "{effectSelected}" to current record?
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
                        Are you sure to delete effect "{effectSelected}" from the effect list?
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
                        // helperText={Object.keys(effectRecordMap).includes(newEffectName) ? "Effect name existed" : ""}
                        // error={Object.keys(effectRecordMap).includes(newEffectName)}
                        onChange={(e) => setNewEffectName(e.target.value)}
                    />
                    <TextField
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
                    />
                    <TextField
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd}>Cancel</Button>
                    <Button
                        onClick={handleAddEffect}
                        disabled={
                            // Object.keys(effectRecordMap).includes(newEffectName) ||
                            !newEffectName ||
                            !newEffectTo ||
                            !newEffectFrom ||
                            parseInt(newEffectFrom) >= controlRecord.length ||
                            parseInt(newEffectTo) >= controlRecord.length ||
                            parseInt(newEffectTo) < parseInt(newEffectFrom)
                        }
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={previewOpened} fullWidth maxWidth="md">
                <DialogTitle>Preview Effect</DialogTitle>
                <DialogContent></DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpened(false)}>Cancel</Button>
                    <Button autoFocus onClick={() => setPreviewOpened(false)}>
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
