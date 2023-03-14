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

import { editCurrentStatusDelta } from "@/core/actions";
import type {
  FiberData,
  CurrentStatusDelta,
  ColorMap,
  ColorID,
} from "@/core/models";

function OFcontrols({
  part,
  currentDancers,
  displayValue,
  colorMap,
}: {
  part: string;
  currentDancers: string[];
  displayValue: FiberData;
  colorMap: ColorMap;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const updateCurrentStatus = (colorID: ColorID, alpha: number) => {
    const currentStatusDelta: CurrentStatusDelta = {};

    currentDancers.forEach((dancerName) => {
      if (!currentStatusDelta[dancerName]) currentStatusDelta[dancerName] = {};
      currentStatusDelta[dancerName][part] = { colorID, alpha };
    });

    editCurrentStatusDelta({ payload: currentStatusDelta });
  };

  const handleColorChange = (colorID: ColorID) => {
    updateCurrentStatus(colorID, displayValue.alpha);
  };

  const handleIntensityChange = (_intensity: number) => {
    updateCurrentStatus(displayValue.colorID, _intensity);
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
              backgroundColor: colorMap[displayValue.colorID].colorCode,
              display: "inline-block",
              width: "1.5em",
              minWidth: "1.5em",
              height: "1.5em",
              minHeight: "1.5em",
              mx: "2em",
            }}
          />
          <Box sx={{ width: "3vw" }}>
            <Typography>{valueLabelFormat(displayValue.alpha)}</Typography>
          </Box>
          <div>{open ? <ExpandLess /> : <ExpandMore />}</div>
        </Box>
      </ListItemButton>

      <Collapse in={open} unmountOnExit>
        <OFcontrolsContent
          handleColorChange={handleColorChange}
          handleIntensityChange={handleIntensityChange}
          intensity={displayValue.alpha}
          currentColorID={displayValue.colorID}
          oneLine
        />
      </Collapse>
    </>
  );
}

export default OFcontrols;
