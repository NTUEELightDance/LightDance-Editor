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

const OFcontrols = ({ part }: { part: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(0);

  const [color, setColor] = useState<string>("transparent");

  const handleExpand = () => {
    setOpen(!open);
  };

  const handleColorChange = (color: string) => {
    setColor(color);
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
              backgroundColor: color,
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

      <Collapse in={open} timeout="auto" mountOnEnter unmountOnExit>
        <OFcontrolsContent
          handleColorChange={handleColorChange}
          intensity={intensity}
          setIntensity={setIntensity}
          oneLine
        />
      </Collapse>
    </>
  );
};

export default OFcontrols;
