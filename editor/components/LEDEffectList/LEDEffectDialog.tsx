import { useState, useCallback, useEffect } from "react";
import { useReactiveVar } from "@apollo/client";
import _ from "lodash";

// actions
import { setupLEDEditor } from "core/actions";
import { setEditor } from "core/actions";

// state
import { reactiveState } from "core/state";
import store from "../../store";

import { getPartType } from "core/utils";
import useTimeInput from "hooks/useTimeInput";

// components
import ModelButton from "./ModelButton";
import LEDPartButton from "./LEDPartButton";

// type
import { isLEDPartName } from "@/core/models";
import type { LEDPartName } from "@/core/models";

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
  // States
  const [chosenModel, setChosenModel] = useState<string>("");
  const [chosenLEDPart, setChosenLEDPart] = useState<string>("");
  const [newLEDEffectName, setNewLEDEffectName] = useState<string>("");
  const [newEffectFromTime, setNewEffectFromTime] = useState<number>(0);
  const { textFieldProps: fromTextFieldProps, timeError: fromTimeError } =
    useTimeInput([
      newEffectFromTime,
      (newTime: number) => {
        setNewEffectFromTime(newTime);
      },
    ]);

  const ledMap = useReactiveVar(reactiveState.ledMap);
  // Dancers and Parts
  const dancers = useReactiveVar(reactiveState.dancers);
  const selected = useReactiveVar(reactiveState.selected);

  const [displayModels, setDisplayModels] = useState<string[]>([""]);
  const [displayLEDParts, setDisplayLEDParts] = useState<string[]>([""]);

  // Update selected models and LED parts
  const { dancerMap } = store.getState().load;

  const updateDisplayModel = useCallback(
    (
      selectedDancers: string[],
      setChosenModel: (modelName: string) => void
    ) => {
      // construct new DisplayModels
      let newDisplayModels: string[] = [];

      // display all models
      Object.keys(dancers).forEach((dancerName) => {
        newDisplayModels = _.union(newDisplayModels, [
          dancerMap[dancerName]["modelName"],
        ]);
      });

      // display selected models without repeat

      // selectedDancers.forEach((dancerName) => {
      //   newDisplayModels = _.union(newDisplayModels, [
      //     dancerMap[dancerName]["modelName"],
      //   ]);
      // });

      setDisplayModels(newDisplayModels);

      // preset chosen model to the first model among selected models
      if (selectedDancers.length !== 0) {
        setChosenModel(dancerMap[selectedDancers[0]]["modelName"]);
      }
    },
    [dancerMap, dancers]
  );

  const updateDisplayPart = useCallback(
    (chosenModel: string) => {
      // construct new displayPart
      let newDisplayLEDParts: string[] = [];

      if (chosenModel) {
        const chosenDancer = Object.entries(dancerMap).find(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([dancerName, dancerData]) => {
            return (
              (dancerData as { url: string; modelName: string })[
                "modelName"
              ] === chosenModel
            );
          }
        );

        if (chosenDancer) {
          newDisplayLEDParts = dancers[chosenDancer[0]].filter((part) => {
            return getPartType(part) === "LED";
          });
        }
      }
      // display all parts without repeat by selected dancers

      // selectedDancers.forEach((dancerName) => {
      //   newDisplayLEDParts = _.union(
      //     newDisplayLEDParts,
      //     dancers[dancerName].filter((part) => {
      //       return getPartType(part) === "LED";
      //     })
      //   );
      // });

      // if newDisplayLEDParts is empty -> show all parts
      if (newDisplayLEDParts.length === 0) {
        Object.values(dancers).forEach((dancerParts) => {
          if (newDisplayLEDParts.length <= 20) {
            //(not show all if there are too many)
            newDisplayLEDParts = _.union(
              newDisplayLEDParts,
              dancerParts.filter((part) => {
                return getPartType(part) === "LED";
              })
            );
          }
        });
      }

      setDisplayLEDParts(newDisplayLEDParts);
    },
    [dancerMap, dancers]
  );

  useEffect(() => {
    if (!dancers || !selected) return;

    const selectedDancers: string[] = [];

    Object.entries(selected).forEach(
      ([dancerName, { selected: dancerSelected }]) => {
        if (dancerSelected) selectedDancers.push(dancerName);
      }
    );

    updateDisplayModel(selectedDancers, setChosenModel);
  }, [dancers, selected, updateDisplayModel, updateDisplayPart]);

  useEffect(() => {
    updateDisplayPart(chosenModel);
  }, [chosenModel, updateDisplayPart]);

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
    if (!isLEDPartName(chosenLEDPart)) {
      return;
    }
    setEditor({ payload: "LED_EDITOR" });
    setupLEDEditor({
      payload: {
        partName: chosenLEDPart as LEDPartName,
        effectName: newLEDEffectName,
        start: newEffectFromTime,
      },
    });
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
                sx={{ mb: 2 }}
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
