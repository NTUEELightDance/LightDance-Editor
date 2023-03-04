import { useState, useEffect, useMemo } from "react";

import { Paper, Typography, Box } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";

import { grey } from "@mui/material/colors";

import { editCurrentStatusDelta } from "@/core/actions";
import type {
  FiberData,
  Selected,
  CurrentStatusDelta,
  SelectedPartPayload,
  LEDData,
} from "@/core/models";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "core/utils";
import LEDcontrolsContent from "./LEDcontrols/LEDcontrolsContent";

import _ from "lodash";

function getSelectedPartsAndType(selected: Selected) {
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
    return [newSelectedParts, assertPartType] as const;
  } else {
    return [newSelectedParts, null] as const;
  }
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

  // initialize local state for fiber
  useEffect(() => {
    if (partType === "FIBER") {
      const [dancerName, parts] = Object.entries(selectedParts)[0] ?? [
        null,
        null,
      ];
      // don't render controls if no part is selected
      if (dancerName == null || parts == null) {
        setCurrentColorName(null);
        setIntensity(null);
        return;
      }

      // check if all selected parts have the same color
      const assertColorName = (currentStatus[dancerName][parts[0]] as FiberData)
        .color;
      if (
        parts.every(
          (part) =>
            (currentStatus[dancerName][part] as FiberData).color ===
            assertColorName
        )
      ) {
        setCurrentColorName(assertColorName);
      } else {
        setCurrentColorName(null);
      }

      // check if all selected parts have the same intensity
      const assertIntensity = (currentStatus[dancerName][parts[0]] as FiberData)
        .alpha;
      if (
        parts.every(
          (part) =>
            (currentStatus[dancerName][part] as FiberData).alpha ===
            assertIntensity
        )
      ) {
        setIntensity(assertIntensity);
      } else {
        setIntensity(null);
      }
    }
  }, [currentStatus, partType, selectedParts]);

  // initialize local state for LED
  useEffect(() => {
    if (partType === "LED") {
      const [dancerName, parts] = Object.entries(selectedParts)[0] ?? [
        null,
        null,
      ];
      // don't render controls if no part is selected
      if (dancerName == null || parts == null) {
        setLEDsrc(null);
        setIntensity(null);
        return;
      }

      // check if all selected parts have the same src
      const assertSrc = (currentStatus[dancerName][parts[0]] as LEDData).src;
      if (
        parts.every(
          (part) =>
            (currentStatus[dancerName][part] as LEDData).src === assertSrc
        )
      ) {
        setLEDsrc(assertSrc);
      } else {
        setLEDsrc(null);
      }

      // check if all selected parts have the same intensity
      const assertIntensity = (currentStatus[dancerName][parts[0]] as LEDData)
        .alpha;
      if (
        parts.every(
          (part) =>
            (currentStatus[dancerName][part] as LEDData).alpha ===
            assertIntensity
        )
      ) {
        setIntensity(assertIntensity);
      } else {
        setIntensity(null);
      }
    }
  }, [currentStatus, partType, selectedParts]);

  // mutate global state
  useEffect(() => {
    const selectedPartsCount = Object.values(selectedParts).flat().length;
    // don't sync when there is no part selected
    if (
      partType === "FIBER" &&
      currentColorName !== null &&
      intensity !== null &&
      selectedPartsCount > 1
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
          currentColorName={currentColorName}
          setIntensity={setIntensity}
          handleColorChange={handleColorChange}
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
