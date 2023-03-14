import { useEffect, useState } from "react";

import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

import Paper from "@mui/material/Paper";
import LEDBulbsControlsContent from "./LEDBulbsControls/LEDBulbsControlsContent";
import useColorMap from "@/hooks/useColorMap";
import { ColorID, LEDBulbData } from "@/core/models";
import {
  editCurrentLEDStatus,
  saveCurrentLEDEffectFrame,
} from "@/core/actions";

function LEDMode() {
  const [currentColorID, setCurrentColorID] = useState<ColorID | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const selectedLEDs = useReactiveVar(reactiveState.selectedLEDs);
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);
  const currentLEDStatus = useReactiveVar(reactiveState.currentLEDStatus);
  const referenceDancerName = useReactiveVar(
    reactiveState.currentLEDEffectReferenceDancer
  );
  const { colorMap } = useColorMap();

  useEffect(() => {
    if (currentLEDPartName == null || referenceDancerName == null) {
      return;
    }
    if (selectedLEDs.length === 0) {
      setCurrentColorID(null);
      setIntensity(null);
      return;
    }

    const partEffect =
      currentLEDStatus[referenceDancerName][currentLEDPartName].effect;

    const selectedLEDEffect = partEffect.filter((effect, i) =>
      selectedLEDs.includes(i)
    );

    if (selectedLEDEffect.length === 0) return;

    const assertColorID = selectedLEDEffect[0].colorID;
    if (selectedLEDEffect.every((effect) => effect.colorID === assertColorID)) {
      setCurrentColorID(assertColorID);
    } else {
      setCurrentColorID(null);
    }

    const assertAlpha = selectedLEDEffect[0].alpha;
    if (selectedLEDEffect.every((effect) => effect.alpha === assertAlpha)) {
      setIntensity(assertAlpha);
    } else {
      setIntensity(null);
    }

    saveCurrentLEDEffectFrame();
  }, [
    selectedLEDs,
    currentLEDPartName,
    currentLEDStatus,
    colorMap,
    referenceDancerName,
  ]);

  if (currentLEDPartName == null || referenceDancerName == null) {
    return <Paper sx={{ width: "100%", minHeight: "100%" }} square />;
  }

  const handleColorChange = (colorID: ColorID) => {
    setCurrentColorID(colorID);
    const LEDBulbsMap = new Map<number, Partial<LEDBulbData>>();
    selectedLEDs.forEach((LEDIndex) => {
      LEDBulbsMap.set(LEDIndex, {
        colorID,
      });
    });

    editCurrentLEDStatus({
      payload: {
        dancerName: referenceDancerName,
        partName: currentLEDPartName,
        LEDBulbsMap,
      },
    });
  };

  const handleIntensityChange = (intensity: number) => {
    setIntensity(intensity);
    const LEDBulbsMap = new Map<number, Partial<LEDBulbData>>();
    selectedLEDs.forEach((LEDIndex) => {
      LEDBulbsMap.set(LEDIndex, {
        alpha: intensity,
      });
    });

    editCurrentLEDStatus({
      payload: {
        dancerName: referenceDancerName,
        partName: currentLEDPartName,
        LEDBulbsMap,
      },
    });
  };

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      {selectedLEDs.length > 0 && (
        <LEDBulbsControlsContent
          currentColorID={currentColorID}
          handleColorChange={handleColorChange}
          intensity={intensity}
          handleIntensityChange={handleIntensityChange}
        />
      )}
    </Paper>
  );
}

export default LEDMode;
