import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  ListItemButton,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import OFcontrolsContent from "./OFcontrolsContent";

import { editCurrentStatusDelta } from "core/actions";
import { Fiber, CurrentStatusDelta } from "core/models";

const OFcontrols = ({
  part,
  currentDancers,
  displayValue,
  colorMap,
}: {
  part: string;
  currentDancers: string[];
  displayValue: Fiber;
  colorMap: { [key: string]: string };
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(displayValue.alpha);
  const [colorName, setColorName] = useState<string>(displayValue.color);

  const updateCurrentStatus = (color: string, alpha: number) => {
    const currentStatusDelta: CurrentStatusDelta = {};

    currentDancers.forEach((dancerName) => {
      if (!currentStatusDelta[dancerName]) currentStatusDelta[dancerName] = {};
      currentStatusDelta[dancerName][part] = { color, alpha };
    });

    editCurrentStatusDelta({ payload: currentStatusDelta });
  };

  const handleColorChange = (_colorName: string) => {
    updateCurrentStatus(_colorName, intensity);
    setColorName(_colorName);
  };

  const handleIntensityChange = (_intensity: number) => {
    updateCurrentStatus(colorName, _intensity);
    setIntensity(_intensity);
  };

  const handleExpand = () => {
    setOpen(!open);
  };

  const valueLabelFormat = (value: number) => {
    return value === 15 ? "flash" : value;
  };

  return (
    <>
      <ListItemButton onClick={handleExpand}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box sx={{ width: "10vw" }}>
            <Typography>{part}</Typography>
          </Box>
          <Paper
            sx={{
              backgroundColor: colorMap[colorName],
              display: "inline-block",
              width: "1.5em",
              height: "1.5em",
              mx: "2em",
            }}
          />
          <Box sx={{ width: "3vw" }}>
            <Typography>{valueLabelFormat(intensity)}</Typography>
          </Box>
          <div>{open ? <ExpandLess /> : <ExpandMore />}</div>
        </Box>
      </ListItemButton>

      <Collapse in={open} mountOnEnter unmountOnExit>
        <OFcontrolsContent
          handleColorChange={handleColorChange}
          handleIntensityChange={handleIntensityChange}
          intensity={intensity}
          setIntensity={setIntensity}
          currentColorName={colorName}
          oneLine
        />
      </Collapse>
    </>
  );
};

export default OFcontrols;
