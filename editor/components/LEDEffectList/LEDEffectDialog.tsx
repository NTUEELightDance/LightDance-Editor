import { useState, useCallback, useEffect } from "react";
import { useReactiveVar } from "@apollo/client";
import _ from "lodash";

// state
import { reactiveState } from "core/state";
import store from "../../store";

import { getPartType } from "core/utils";
import useTimeInput from "hooks/useTimeInput";

// components
import ModelButton from "./ModelButton";
import LEDPartButton from "./LEDPartButton";

// mui
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
  const selected = useReactiveVar(reactiveState.selected);

  const [displayModels, setDisplayModels] = useState<string[]>(["A", "B", "C"]);
  const [displayLEDParts, setDisplayLEDParts] = useState<string[]>(["1"]);

  // Update selected models and LED parts
  const { dancerMap } = store.getState().load;

  const updateDisplayModel = useCallback(
    (selectedDancers: string[]) => {
      if (selectedDancers.length === 0) return; ////// show all

      // construct new DisplayModels
      let newDisplayModels: string[] = [];

      // get all parts without repeat

      selectedDancers.forEach((dancerName) => {
        newDisplayModels = _.union(newDisplayModels, [
          dancerMap[dancerName]["modelName"],
        ]);
      });

      /////// if newDisplayLEDParts === empty -> show all
      setDisplayModels(newDisplayModels);
    },
    [dancerMap]
  );

  const updateDisplayPart = useCallback(
    (selectedDancers: string[]) => {
      // construct new displayPart
      let newDisplayLEDParts: string[] = [];

      // get all parts without repeat
      selectedDancers.forEach((dancerName) => {
        newDisplayLEDParts = _.union(
          newDisplayLEDParts,
          dancers[dancerName].filter((part) => {
            return getPartType(part) === "LED";
          })
        );
      });

      // if newDisplayLEDParts is empty -> show all parts
      if (newDisplayLEDParts.length === 0) {
        Object.values(dancers).forEach((dancer) => {
          newDisplayLEDParts = _.union(
            newDisplayLEDParts,
            dancer.filter((part) => {
              return getPartType(part) === "LED";
            })
          );
        });
      }

      setDisplayLEDParts(newDisplayLEDParts);
    },
    [dancers]
  );

  useEffect(() => {
    if (!dancers || !selected) return;

    const selectedDancers: string[] = [];

    Object.entries(selected).forEach(
      ([dancerName, { selected: dancerSelected }]) => {
        if (dancerSelected) selectedDancers.push(dancerName);
      }
    );

    updateDisplayPart(selectedDancers);
    updateDisplayModel(selectedDancers);
  }, [dancers, selected, updateDisplayModel, updateDisplayPart]);

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
      setChosenModel(newChosenModel);
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
