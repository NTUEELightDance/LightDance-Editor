import { useEffect, useMemo, useState } from "react";

import { Paper, Typography, Box } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";

import { grey } from "@mui/material/colors";

import { editCurrentStatusDelta } from "core/actions";
import type {
  FiberData,
  Selected,
  CurrentStatusDelta,
  PartPayload,
  PartType,
} from "core/models";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "core/utils";
import LEDcontrolsContent from "./LEDcontrols/LEDcontrolsContent";

import _ from "lodash";

function getSelectedPartsAndType(
  selected: Selected
): [PartPayload, PartType | null] {
  const newSelectedParts: PartPayload = {};
  const tempSelectedParts: string[] = [];
  Object.entries(selected).forEach(([dancerName, { parts }]) => {
    if (parts.length > 0) {
      newSelectedParts[dancerName] = parts;
      parts.forEach((part) => {
        tempSelectedParts.push(part);
      });
    }
  });
  const assertPartType = getPartType(tempSelectedParts[0]);
  if (tempSelectedParts.every((part) => getPartType(part) === assertPartType)) {
    return [newSelectedParts, assertPartType];
  } else return [newSelectedParts, null];
}

function PartMode() {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);

  const [selectedParts, partType] = useMemo(
    () => getSelectedPartsAndType(selected),
    [selected]
  );

  const [currentColorName, setCurrentColorName] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(0);
  const [LEDsrc, setLEDsrc] = useState<string>("");

  // update local state
  useEffect(() => {
    // cannot sync if partType is null or LED
    if (partType === "LED" || partType === null) return;
    const [dancerName, parts] = Object.entries(selectedParts)[0];
    setCurrentColorName(
      (currentStatus[dancerName][parts[0]] as FiberData).color
    );
    setIntensity((currentStatus[dancerName][parts[0]] as FiberData).alpha);
  }, [currentStatus, partType, selectedParts]);

  // mutate global state
  useEffect(() => {
    const currentStatusDelta: CurrentStatusDelta = {};
    Object.entries(selectedParts).forEach(([dancerName, parts]) => {
      parts.forEach((partName) => {
        currentStatusDelta[dancerName] ||= {};

        switch (partType) {
          case null:
            break;
          case "LED":
            currentStatusDelta[dancerName][partName] = {
              src: LEDsrc,
              alpha: intensity,
            };
            break;
          case "FIBER":
            currentStatusDelta[dancerName][partName] = {
              color: currentColorName,
              alpha: intensity,
            };
            break;
        }
      });
      editCurrentStatusDelta({ payload: currentStatusDelta });
    });
  }, [intensity, currentColorName, partType, selectedParts, LEDsrc]);

  const handleColorChange = (color: string) => {
    setCurrentColorName(color);
  };

  // partNames for led  controls
  const partNames = _.uniq(Object.values(selectedParts).flat());

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      {partType === "LED" ? (
        <LEDcontrolsContent
          parts={partNames}
          intensity={intensity}
          src={LEDsrc}
          handleIntensityChange={setIntensity}
          handleSrcChange={setLEDsrc}
        />
      ) : partType === "FIBER" ? (
        <OFcontrolsContent
          intensity={intensity}
          setIntensity={setIntensity}
          handleColorChange={handleColorChange}
          currentColorName={currentColorName}
        />
      ) : (
        Object.keys(selectedParts).length > 0 && (
          <Box sx={{ px: "3em" }}>
            <Typography color={grey[600]}>
              You've selected parts of different types, please select parts with
              the same type.
            </Typography>
          </Box>
        )
      )}
    </Paper>
  );
}

export default PartMode;
