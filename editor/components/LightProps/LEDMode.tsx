import { useEffect, useState } from "react";

import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

import Paper from "@mui/material/Paper";
import LEDBulbsControlsContent from "./LEDBulbsControls/LEDBulbsControlsContent";
import { getDancerFromLEDpart } from "@/core/utils";
import useColorMap from "@/hooks/useColorMap";
import { LEDBulbData } from "@/core/models";
import { editCurrentLEDStatus } from "@/core/actions";

function LEDMode() {
  const [currentColorName, setCurrentColorName] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const selectedLEDs = useReactiveVar(reactiveState.selectedLEDs);
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);
  const currentLEDStatus = useReactiveVar(reactiveState.currentLEDStatus);
  const { colorMap } = useColorMap();

  useEffect(() => {
    if (currentLEDPartName == null) {
      return;
    }
    if (selectedLEDs.length === 0) {
      setCurrentColorName(null);
      setIntensity(null);
      return;
    }

    const dancerName = getDancerFromLEDpart(currentLEDPartName);

    const partEffect = currentLEDStatus[dancerName][currentLEDPartName].effect;

    const selectedLEDEffect = partEffect.filter((effect, i) =>
      selectedLEDs.includes(i)
    );

    if (selectedLEDEffect.length === 0) return;

    const assertColorCode = selectedLEDEffect[0].colorCode;
    if (
      selectedLEDEffect.every((effect) => effect.colorCode === assertColorCode)
    ) {
      setCurrentColorName(
        Object.keys(colorMap).find(
          (colorName) => colorMap[colorName] === assertColorCode
        ) ?? null
      );
    } else {
      setCurrentColorName(null);
    }

    const assertAlpha = selectedLEDEffect[0].alpha;
    if (selectedLEDEffect.every((effect) => effect.alpha === assertAlpha)) {
      setIntensity(assertAlpha);
    } else {
      setIntensity(null);
    }
  }, [selectedLEDs, currentLEDPartName, currentLEDStatus, colorMap]);

  if (currentLEDPartName == null) {
    return <Paper sx={{ width: "100%", minHeight: "100%" }} square />;
  }

  const dancerName = getDancerFromLEDpart(currentLEDPartName);

  const handleColorChange = (colorName: string) => {
    setCurrentColorName(colorName);
    const colorCode = colorMap[colorName];
    const LEDBulbsMap = new Map<number, Partial<LEDBulbData>>();
    selectedLEDs.forEach((LEDIndex) => {
      LEDBulbsMap.set(LEDIndex, {
        colorCode,
      });
    });

    editCurrentLEDStatus({
      payload: {
        dancerName,
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
        dancerName,
        partName: currentLEDPartName,
        LEDBulbsMap,
      },
    });
  };

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }} square>
      <LEDBulbsControlsContent
        currentColorName={currentColorName}
        handleColorChange={handleColorChange}
        intensity={intensity}
        handleIntensityChange={handleIntensityChange}
      />
    </Paper>
  );
}

export default LEDMode;
