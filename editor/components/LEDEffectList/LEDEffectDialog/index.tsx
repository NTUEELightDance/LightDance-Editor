import { useState, useCallback, useEffect } from "react";
import _ from "lodash";
import { notification } from "core/utils";

// components
import ModelButton from "./ModelButton";
import LEDPartButton from "./LEDPartButton";
import EffectNameTextField from "./EffectNameTextField";

import { setupLEDEditor } from "core/actions";
import { reactiveState } from "core/state";
import store from "@/store";

import { getPartType } from "core/utils";
import { useReactiveVar } from "@apollo/client";
import type { LEDMap } from "@/core/models";

// type
import { isLEDPartName } from "@/core/models";
import type { LEDPartName } from "@/core/models";
import type { LedEffectOptionType } from "./EffectNameTextField";

// mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const ledMap: LEDMap = useReactiveVar(reactiveState.ledMap);

  // States

  // There are three different action mode depending on the new effect name:
  // 1. "IDLE" means that the new name is empty.
  // 2. "ADD" implies the entered name is a brand-new name and displays ADD button.
  // 3. "EDIT" suggests that the name is match with an existing effect name, causing an EDIT button to show.
  const [actionMode, setActionMode] = useState<"IDLE" | "EDIT" | "ADD">("IDLE");
  const [newEffect, setNewEffect] = useState<LedEffectOptionType | null>(null);

  const [chosenModel, setChosenModel] = useState<string | null>(null);
  const [chosenLEDPart, setChosenLEDPart] = useState<LEDPartName | null>(null);

  // Dancers and Parts
  const dancers = useReactiveVar(reactiveState.dancers);
  const selected = useReactiveVar(reactiveState.selected);

  const [displayModels, setDisplayModels] = useState<string[]>([]);
  const [displayLEDParts, setDisplayLEDParts] = useState<LEDPartName[]>([]);

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
      let newDisplayLEDParts: LEDPartName[] = [];

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
          newDisplayLEDParts = dancers[chosenDancer[0]].filter((part) =>
            isLEDPartName(part)
          ) as LEDPartName[];
        }
      }
      // Display all parts without repeat by selected dancers

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
            ) as LEDPartName[];
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
    if (!chosenModel) return;

    updateDisplayPart(chosenModel);
  }, [chosenModel, updateDisplayPart]);

  // Reset and Close
  function reset() {
    setChosenModel(null);
    setChosenLEDPart(null);
    setActionMode("IDLE");
    setNewEffect(null);
  }
  function closeAndReset() {
    handleClose();
    reset();
  }

  // Handle function
  const handleChangeChosenModel = (newChosenModel: string) => {
    if (newChosenModel !== null) {
      setChosenModel(newChosenModel);
    }
    return;
  };

  const handleChangeChosenLEDPart = async (newChosenPart: string) => {
    if (!isLEDPartName(newChosenPart)) return;
    // In the "EDIT" mode, if newly selected part doesn't have the chosen effect,
    // than deliver a warning.)
    if (actionMode === "EDIT" && newChosenPart) {
      const valid = Object.keys(ledMap[newChosenPart]).some((effectName) => {
        return effectName === newEffect?.LEDEffectName;
      });

      if (!valid) {
        notification.warning(
          "Warning! The selected part does not have the chosen effect."
        );
        return;
      }
    }
    setChosenLEDPart(newChosenPart);
  };

  const handleAddLEDEffect = () => {
    if (!isLEDPartName(chosenLEDPart)) return;
    if (!newEffect) return;
    setupLEDEditor({
      payload: {
        partName: chosenLEDPart as LEDPartName,
        effectName: newEffect.LEDEffectName,
      },
    });
    closeAndReset();
  };

  const handleEditLEDEffect = () => {
    if (!isLEDPartName(chosenLEDPart)) return;
    if (!newEffect) return;
    setupLEDEditor({
      payload: {
        partName: chosenLEDPart as LEDPartName,
        effectName: newEffect.LEDEffectName,
      },
    });
    closeAndReset();
  };

  // Return
  return (
    <div>
      <Paper>
        <Dialog open={addDialogOpen} onClose={closeAndReset}>
          <DialogTitle>Customize LED Effect</DialogTitle>
          <DialogContent>
            <Grid sx={{ mb: 2, mt: 2 }}>
              <EffectNameTextField
                chosenLEDPart={chosenLEDPart}
                handleChangeChosenModel={handleChangeChosenModel}
                handleChangeChosenLEDPart={handleChangeChosenLEDPart}
                setActionMode={setActionMode}
                newEffect={newEffect}
                setNewEffect={setNewEffect}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAndReset}>Cancel</Button>
            {actionMode === "EDIT" ? (
              <Button
                onClick={handleEditLEDEffect}
                disabled={actionMode != "EDIT" || !chosenLEDPart}
              >
                Edit
              </Button>
            ) : (
              <Button
                onClick={handleAddLEDEffect}
                disabled={actionMode != "ADD" || !chosenLEDPart}
              >
                Add
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}
