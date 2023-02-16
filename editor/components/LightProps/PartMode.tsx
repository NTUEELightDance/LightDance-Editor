import { useState, useEffect, useMemo, useCallback } from "react";

import { Paper, Typography, Box } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";

import { grey } from "@mui/material/colors";

import { editCurrentStatusDelta } from "@/core/actions";
import type {
  FiberData,
  Selected,
  CurrentStatusDelta,
  SelectedPartPayload,
  PartType,
} from "@/core/models";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "core/utils";
import LEDcontrolsContent from "./LEDcontrols/LEDcontrolsContent";

import _ from "lodash";

function getSelectedPartsAndType(
  selected: Selected
): [SelectedPartPayload, PartType | null] {
  const newSelectedParts: SelectedPartPayload = {};
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

function calculateCurrentStatusDeltaLED(
  selectedParts: SelectedPartPayload,
  LEDsrc: string,
  intensity: number
) {
  const currentStatusDelta: CurrentStatusDelta = {};
  Object.entries(selectedParts).forEach(([dancerName, parts]) => {
    parts.forEach((partName) => {
      currentStatusDelta[dancerName] ||= {};

      currentStatusDelta[dancerName][partName] = {
        src: LEDsrc,
        alpha: intensity,
      };
    });
  });

  return currentStatusDelta;
}

function calculateCurrentStatusDeltaFiber(
  selectedParts: SelectedPartPayload,
  colorName: string,
  intensity: number
) {
  const currentStatusDelta: CurrentStatusDelta = {};
  Object.entries(selectedParts).forEach(([dancerName, parts]) => {
    parts.forEach((partName) => {
      currentStatusDelta[dancerName] ||= {};

      currentStatusDelta[dancerName][partName] = {
        color: colorName,
        alpha: intensity,
      };
    });
  });

  return currentStatusDelta;
}

function PartMode() {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);

  const [selectedParts, partType] = useMemo(
    () => getSelectedPartsAndType(selected),
    [selected]
  );

  const [currentColorName, setCurrentColorName] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [LEDsrc, setLEDsrc] = useState<string | null>(null);

  // update local state
  useEffect(() => {
    // cannot sync if partType is null or LED
    if (partType === "LED" || partType === null) return;
    const [dancerName, parts] = Object.entries(selectedParts)[0] ?? [
      null,
      null,
    ];
    // don't render controls if no part is selected
    if (dancerName == null || parts == null) {
      setCurrentColorName(null);
      setIntensity(null);
    } else {
      setCurrentColorName(
        (currentStatus[dancerName][parts[0]] as FiberData).color
      );
      setIntensity((currentStatus[dancerName][parts[0]] as FiberData).alpha);
    }
  }, [currentStatus, partType, selectedParts]);

  // mutate global state
  useEffect(() => {
    // don't sync when there is no part selected
    if (
      partType === "FIBER" &&
      currentColorName !== null &&
      intensity !== null
    ) {
      const currentStatusDelta = calculateCurrentStatusDeltaFiber(
        selectedParts,
        currentColorName,
        intensity
      );
      editCurrentStatusDelta({ payload: currentStatusDelta });
    }
  }, [currentColorName, intensity, partType, selectedParts]);

  useEffect(() => {
    // don't sync when there is no part selected
    if (partType === "LED" && LEDsrc !== null && intensity !== null) {
      const currentStatusDelta = calculateCurrentStatusDeltaLED(
        selectedParts,
        LEDsrc,
        intensity
      );
      editCurrentStatusDelta({ payload: currentStatusDelta });
    }
  }, [LEDsrc, intensity, partType, selectedParts]);

  const handleColorChange = (color: string) => {
    setCurrentColorName(color);
  };

  // partNames for led  controls
  const partNames = _.uniq(Object.values(selectedParts).flat());

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      {partType === "LED" && LEDsrc !== null && intensity !== null ? (
        <LEDcontrolsContent
          parts={partNames}
          intensity={intensity}
          src={LEDsrc}
          handleIntensityChange={setIntensity}
          handleSrcChange={setLEDsrc}
        />
      ) : partType === "FIBER" &&
        currentColorName !== null &&
        intensity !== null ? (
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
