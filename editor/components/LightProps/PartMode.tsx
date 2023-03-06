import { useState, useEffect, useMemo } from "react";

import { Paper } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";

import { editCurrentStatusDelta } from "@/core/actions";
import {
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
import MixedControlsContent from "./MixedControls/MixedControlsContent";

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

  useEffect(() => {
    if (partType === "FIBER") {
      const [dancerName0, parts0] = Object.entries(selectedParts)[0] ?? [
        null,
        null,
      ];
      // don't render controls if no part is selected
      if (dancerName0 == null || parts0 == null) {
        setCurrentColorName(null);
        setIntensity(null);
        return;
      }

      // check if all selected parts have the same color
      const assertColorName = (
        currentStatus[dancerName0][parts0[0]] as FiberData
      ).color;
      if (
        Object.entries(selectedParts).every(([dancerName, parts]) =>
          parts.every(
            (part) =>
              (currentStatus[dancerName][part] as FiberData).color ===
              assertColorName
          )
        )
      ) {
        setCurrentColorName(assertColorName);
      } else {
        setCurrentColorName(null);
      }

      // check if all selected parts have the same intensity
      const assertIntensity = (
        currentStatus[dancerName0][parts0[0]] as FiberData
      ).alpha;
      if (
        Object.entries(selectedParts).every(([dancerName, parts]) =>
          parts.every(
            (part) =>
              (currentStatus[dancerName][part] as FiberData).alpha ===
              assertIntensity
          )
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
      const [dancerName0, parts0] = Object.entries(selectedParts)[0] ?? [
        null,
        null,
      ];
      // don't render controls if no part is selected
      if (dancerName0 == null || parts0 == null) {
        setLEDsrc(null);
        setIntensity(null);
        return;
      }

      // check if all selected parts have the same src
      const assertSrc = (currentStatus[dancerName0][parts0[0]] as LEDData).src;
      if (
        Object.entries(selectedParts).every(([dancerName, parts]) =>
          parts.every(
            (part) =>
              (currentStatus[dancerName][part] as LEDData).src === assertSrc
          )
        )
      ) {
        setLEDsrc(assertSrc);
      } else {
        setLEDsrc(null);
      }

      // check if all selected parts have the same intensity
      const assertIntensity = (currentStatus[dancerName0][parts0[0]] as LEDData)
        .alpha;
      if (
        Object.entries(selectedParts).every(([dancerName, parts]) =>
          parts.every(
            (part) =>
              (currentStatus[dancerName][part] as LEDData).alpha ===
              assertIntensity
          )
        )
      ) {
        setIntensity(assertIntensity);
      } else {
        setIntensity(null);
      }
    }
  }, [currentStatus, partType, selectedParts]);

  // initialize local state for mixed
  useEffect(() => {
    if (partType === "MIXED" && Object.keys(selectedParts).length > 0) {
      const [dancerName0, parts0] = Object.entries(selectedParts)[0];

      const assertIntensity = (
        currentStatus[dancerName0][parts0[0]] as LEDData | FiberData
      ).alpha;

      if (
        Object.entries(selectedParts).every(([dancerName, parts]) =>
          parts.every((part) => {
            const partData = currentStatus[dancerName][part] as
              | LEDData
              | FiberData;
            return partData.alpha === assertIntensity;
          })
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
    if (partType === "LED" && LEDsrc !== null && intensity !== null) {
      const currentStatusDelta = calculateCurrentStatusDeltaLED(
        selectedParts,
        LEDsrc,
        intensity
      );
      editCurrentStatusDelta({ payload: currentStatusDelta });
    }
  }, [LEDsrc, intensity, partType, selectedParts]);

  useEffect(() => {
    if (
      partType === "MIXED" &&
      intensity !== null &&
      Object.keys(selectedParts).length > 0
    ) {
      const currentStatusDelta = calculateCurrentStatusDeltaMixed(
        selectedParts,
        intensity
      );
      editCurrentStatusDelta({ payload: currentStatusDelta });
    }
  }, [intensity, partType, selectedParts]);

  // reset local state when partType is NONE
  useEffect(() => {
    if (partType === "NONE") {
      setCurrentColorName(null);
      setLEDsrc(null);
      setIntensity(null);
    }
  }, [partType]);

  // partNames for led  controls
  const partNames = [...new Set(Object.values(selectedParts).flat())];

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
          handleIntensityChange={setIntensity}
          handleColorChange={setCurrentColorName}
        />
      ) : partType === "MIXED" && Object.keys(selectedParts).length > 0 ? (
        <MixedControlsContent
          intensity={intensity}
          handleIntensityChange={setIntensity}
        />
      ) : null}
    </Paper>
  );
}

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

  if (tempSelectedParts.length === 0) {
    return [newSelectedParts, "NONE"] as const;
  }

  const assertPartType = getPartType(tempSelectedParts[0]);
  if (tempSelectedParts.every((part) => getPartType(part) === assertPartType)) {
    return [newSelectedParts, assertPartType] as const;
  } else {
    return [newSelectedParts, "MIXED"] as const;
  }
}

function calculateCurrentStatusDeltaFiber(
  selectedParts: SelectedPartPayload,
  colorName: string,
  intensity: number
) {
  const currentStatusDelta: CurrentStatusDelta = {};
  Object.entries(selectedParts).forEach(([dancerName, parts]) => {
    parts.forEach((partName) => {
      currentStatusDelta[dancerName] ??= {};

      currentStatusDelta[dancerName][partName] = {
        color: colorName,
        alpha: intensity,
      };
    });
  });

  return currentStatusDelta;
}

function calculateCurrentStatusDeltaLED(
  selectedParts: SelectedPartPayload,
  LEDsrc: string,
  intensity: number
) {
  const currentStatusDelta: CurrentStatusDelta = {};
  Object.entries(selectedParts).forEach(([dancerName, parts]) => {
    parts.forEach((partName) => {
      currentStatusDelta[dancerName] ??= {};

      currentStatusDelta[dancerName][partName] = {
        src: LEDsrc,
        alpha: intensity,
      };
    });
  });

  return currentStatusDelta;
}

function calculateCurrentStatusDeltaMixed(
  selectedParts: SelectedPartPayload,
  intensity: number
) {
  const currentStatusDelta: CurrentStatusDelta = {};
  Object.entries(selectedParts).forEach(([dancerName, parts]) => {
    parts.forEach((partName) => {
      currentStatusDelta[dancerName] ??= {};

      currentStatusDelta[dancerName][partName] = {
        alpha: intensity,
      };
    });
  });

  return currentStatusDelta;
}

export default PartMode;
