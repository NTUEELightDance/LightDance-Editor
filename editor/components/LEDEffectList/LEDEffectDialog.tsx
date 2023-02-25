import { useState, useCallback, useEffect } from "react";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import _ from "lodash";
import { getPartType } from "core/utils";
import useTimeInput from "hooks/useTimeInput";
import ModelButton from "./modelButton";
import LEDPartButton from "./LEDPartButton";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Paper,
} from "@mui/material";

export interface LEDEffectDialogProps {
  addDialogOpen: boolean;
  handleClose: () => void;
}

export default function LEDEffectDialog({
  addDialogOpen,
  handleClose,
}: LEDEffectDialogProps) {
  // Dancers and Parts

  const dancers = useReactiveVar(reactiveState.dancers);
  const dancersNames = useReactiveVar(reactiveState.dancerNames);
  const selected = useReactiveVar(reactiveState.selected);

  const [displayModels, setdisplayModels] = useState<string[]>(["A", "B", "C"]);
  const [displayLEDParts, setDisplayLEDParts] = useState<string[]>(["1"]);

  const updateDisplayPart = useCallback(
    (selectedDancers: string[]) => {
      if (selectedDancers.length === 0) return; ////// show all

      // get all parts without repeat
      let tempParts: string[] = dancers[selectedDancers[0]];
      selectedDancers.forEach((dancerName) => {
        tempParts = _.union(tempParts, dancers[dancerName]);
      });

      // construct new displayPart
      const newDisplayLEDParts: string[] = [];

      tempParts.forEach((part) => {
        if (getPartType(part) == "LED") {
          newDisplayLEDParts.push(part);
        }
      });

      /////// if newDisplayLEDParts === empty -> show all
      setDisplayLEDParts(newDisplayLEDParts);
    },
    [dancers]
  );

  // Update selected models and parts
  useEffect(() => {
    if (!dancers || !selected) return;

    const selectedDancers: string[] = [];
    console.log("dancers");
    console.log(dancers);
    console.log(dancersNames);

    Object.entries(selected).forEach(
      ([dancerName, { selected: dancerSelected }]) => {
        if (dancerSelected) selectedDancers.push(dancerName);
      }
    );

    updateDisplayPart(selectedDancers);
  }, [dancers, selected, updateDisplayPart]);

  // States
  const [chosenModel, setChosenModel] = useState<string>("");
  const [chosenLEDPart, setChosenLEDPart] = useState<string>("");
  const [newLEDEffectName, setNewLEDEffectName] = useState<string>("");
  const [newEffectFromTime, setNewEffectFromTime] = useState<number>(0);
  const {
    textFieldProps: fromTextFieldProps,
    timeError: fromTimeError,
    timeInputRef: fromTimeInputRef,
  } = useTimeInput([
    newEffectFromTime,
    (newTime: number) => {
      setNewEffectFromTime(newTime);
    },
  ]);

  // Reset and Close
  function reset() {
    handleClose();
    setChosenModel("");
    setChosenLEDPart("");
    setNewLEDEffectName("");
    setNewEffectFromTime(0);
  }

  // Handle function
  const handleChangeChosenModel = (
    event: React.MouseEvent<HTMLElement>,
    newChosenModel: string
  ) => {
    if (newChosenModel !== null) {
      //setChosenModel(newChosenModel);
    }
    return;
  };

  const handleChangeChosenLEDPart = (
    event: React.MouseEvent<HTMLElement>,
    newChosenPart: string
  ) => {
    if (newChosenPart !== null) {
      setChosenLEDPart(newChosenPart);
    }
    return;
  };

  const handleAddLEDEffect = () => {
    reset();
  };

  // Return
  return (
    <div>
      <Paper>
        <Dialog open={addDialogOpen} onClose={reset}>
          <DialogTitle>New LED Effect</DialogTitle>
          <DialogContent>
            <Grid>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="New Effect Name"
                required
                fullWidth
                variant="standard"
                value={newLEDEffectName}
                onChange={(e) => {
                  setNewLEDEffectName(e.target.value);
                }}
              />
            </Grid>
            <Grid>
              <ModelButton
                chosenModel={chosenModel}
                handleChangeChosenModel={handleChangeChosenModel}
                displayModels={displayModels}
              />
            </Grid>
            <Grid>
              <LEDPartButton
                chosenLEDPart={chosenLEDPart}
                handleChangeChosenLEDPart={handleChangeChosenLEDPart}
                displayLEDParts={displayLEDParts}
              />
            </Grid>
            <Grid>
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={reset}>Cancel</Button>
            <Button
              onClick={handleAddLEDEffect}
              disabled={!newLEDEffectName || !chosenLEDPart}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}
