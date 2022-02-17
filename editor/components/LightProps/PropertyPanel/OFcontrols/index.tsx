import { useState } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemText,
  ListItemButton,
  Collapse,
  Slider,
  Input,
} from "@mui/material";
import { TabPanel } from "@mui/lab";
import { ExpandLess, ExpandMore, Flare } from "@mui/icons-material";
import ColorSelector from "../../ColorSelector";

import { PartType } from "../../../../hooks/useDancer";

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

  const sliderMarks: { value: number; label: string | JSX.Element | null }[] =
    [];
  for (let i = 0; i <= 10; i++) {
    sliderMarks.push({
      value: i,
      label: i === 0 || i === 10 ? String(i) : null,
    });
  }
  sliderMarks.push({ value: 15, label: <Flare sx={{ fontSize: "1.25em" }} /> });

  const handleSliderChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    setIntensity(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = Number(event.target.value);
    if (intensity < 0) setIntensity(0);
    else if (intensity === 11 || intensity >= 15) setIntensity(15);
    else if (intensity >= 12 && intensity <= 14) setIntensity(10);
    else setIntensity(intensity);
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
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            justifyContent: "space-between",
            px: "3em",
          }}
        >
          <Grid item>
            <ColorSelector placeholder="none" onChange={handleColorChange} />
          </Grid>
          <Grid item>
            <Slider
              value={intensity}
              onChange={handleSliderChange}
              min={0}
              max={15}
              step={null}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              marks={sliderMarks}
              sx={{
                width: "10em",
                position: "relative",
                top: "0.5em",
              }}
              componentsProps={
                {
                  thumb: {
                    sx: {
                      width: "1.25em",
                      height: "1.25em",
                    },
                  },
                } as any
              }
            />
          </Grid>
          <Grid item>
            <Input
              value={intensity}
              size="small"
              onChange={handleInputChange}
              inputProps={{
                step: 1,
                min: 0,
                max: 15,
                type: "number",
              }}
              sx={{ width: "3em" }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </>
  );
};

export default OFcontrols;
