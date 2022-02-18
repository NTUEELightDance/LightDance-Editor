import { Paper } from "@mui/material";

import OFcontrolsContent from "./OFcontrols/OFcontrolsContent";
import IntensityControl from "./IntensityControl";

import useDancer, { PartType } from "../../hooks/useDancer";

import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

import { PartPayloadType } from "core/models";
import { useEffect, useState } from "react";

const PartMode = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const { getPartType } = useDancer();

  const [selectedParts, setSelectedParts] = useState<PartPayloadType>({});
  const [partType, setPartType] = useState<PartType | null>(null);

  const [intensity, setIntensity] = useState<number>(0);
  const [color, setColor] = useState<string>();

  useEffect(() => {
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
    if (
      tempSelectedParts.every((part) => getPartType(part) === assertPartType)
    ) {
      setPartType(assertPartType);
      setSelectedParts(newSelectedParts);
    }
  }, [selected]);

  const handleColorChange = (color: string) => {
    setColor(color);
  };

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", pt: "1.5em" }}>
      {partType === "LED" ? (
        <IntensityControl intensity={intensity} setIntensity={setIntensity} />
      ) : (
        <OFcontrolsContent
          intensity={intensity}
          setIntensity={setIntensity}
          handleColorChange={handleColorChange}
        />
      )}
    </Paper>
  );
};

export default PartMode;
