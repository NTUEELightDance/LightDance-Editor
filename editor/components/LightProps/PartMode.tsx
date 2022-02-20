import { useEffect, useState } from "react";

import { Paper, Grid } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";
import IntensityControl from "./IntensityControl";

import {
  editCurrentStatusFiber,
  editCurrentStatusLED,
} from "../../core/actions";
import { Fiber, SelectedType } from "../../core/models";
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "../../core/utils";
import { PartPayloadType, PartType } from "core/models";

const getSelectedPartsAndTypes = (selected: SelectedType) => {
  const newSelectedParts: PartPayloadType = {};
  const tempSelectedParts: string[] = [];
  Object.entries(selected).forEach(
    ([dancerName, { selected: dancerSelected, parts }]) => {
      if (parts.length > 0) {
        newSelectedParts[dancerName] = parts;
        parts.forEach((part) => {
          tempSelectedParts.push(part);
        });
      }
    }
  );
  const assertPartType = getPartType(tempSelectedParts[0]);
  if (tempSelectedParts.every((part) => getPartType(part) === assertPartType)) {
    return [newSelectedParts, assertPartType];
  } else return [{}, null];
};

const PartMode = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);

  const [defaultSelectedParts, defaultPartType] =
    getSelectedPartsAndTypes(selected);
  const [selectedParts, setSelectedParts] = useState<PartPayloadType>(
    defaultSelectedParts as PartPayloadType
  );
  const [partType, setPartType] = useState<PartType | null>(
    defaultPartType as PartType
  );

  const [currentColorName, setCurrentColorName] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(0);

  // update local state
  useEffect(() => {
    const [newSelectedParts, newPartType] = getSelectedPartsAndTypes(selected);
    setSelectedParts(newSelectedParts as PartPayloadType);
    setPartType(newPartType as PartType);

    if (newPartType === "LED" || !newPartType) return;
    const [dancerName, parts] = Object.entries(
      newSelectedParts as PartPayloadType
    )[0];
    setCurrentColorName((currentStatus[dancerName][parts[0]] as Fiber).color);
    setIntensity((currentStatus[dancerName][parts[0]] as Fiber).alpha);
  }, [currentStatus, selected]);

  // mutate globnal state
  useEffect(() => {
    Object.entries(selectedParts).forEach(([dancerName, parts]) => {
      parts.forEach((partName) => {
        switch (partType) {
          case "LED":
            editCurrentStatusLED({
              payload: {
                dancerName,
                partName,
                value: { src: "", alpha: intensity },
              },
            });
            break;
          case "FIBER":
            editCurrentStatusFiber({
              payload: {
                dancerName,
                partName,
                value: { color: currentColorName, alpha: intensity },
              },
            });
            break;
        }
      });
    });
  }, [intensity, currentColorName]);

  const handleColorChange = (color: string) => {
    setCurrentColorName(color);
  };

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      {partType === "LED" ? (
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            justifyContent: "space-between",
            px: "5em",
          }}
        >
          <IntensityControl intensity={intensity} setIntensity={setIntensity} />
        </Grid>
      ) : partType === "FIBER" ? (
        <OFcontrolsContent
          intensity={intensity}
          setIntensity={setIntensity}
          handleColorChange={handleColorChange}
          currentColorName={currentColorName}
        />
      ) : (
        <></>
      )}
    </Paper>
  );
};

export default PartMode;
