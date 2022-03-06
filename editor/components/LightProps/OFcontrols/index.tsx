import { useEffect, useState } from "react";

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
  displayValue: { color, alpha },
  colorMap,
}: {
  part: string;
  currentDancers: string[];
  displayValue: Fiber;
  colorMap: { [key: string]: string };
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const updateCurrentStatus = (color: string, alpha: number) => {
    const currentStatusDelta: CurrentStatusDelta = {};

    currentDancers.forEach((dancerName) => {
      if (!currentStatusDelta[dancerName]) currentStatusDelta[dancerName] = {};
      currentStatusDelta[dancerName][part] = { color, alpha };
    });

    editCurrentStatusDelta({ payload: currentStatusDelta });
  };

  const handleColorChange = (_colorName: string) => {
    updateCurrentStatus(_colorName, alpha);
  };

  const handleIntensityChange = (_intensity: number) => {
    updateCurrentStatus(color, _intensity);
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
              backgroundColor: colorMap[color],
              display: "inline-block",
              width: "1.5em",
              height: "1.5em",
              mx: "2em",
            }}
          />
          <Box sx={{ width: "3vw" }}>
            <Typography>{valueLabelFormat(alpha)}</Typography>
          </Box>
          <div>{open ? <ExpandLess /> : <ExpandMore />}</div>
        </Box>
      </ListItemButton>

      <Collapse in={open} mountOnEnter unmountOnExit>
        <OFcontrolsContent
          handleColorChange={handleColorChange}
          handleIntensityChange={handleIntensityChange}
          intensity={alpha}
          currentColorName={color}
          oneLine
        />
      </Collapse>
    </>
  );
};

export default OFcontrols;
