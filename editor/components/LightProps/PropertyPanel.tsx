import { useState } from "react";

import {
  Box,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Slider,
  Input,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useSelect } from "@mui/base/SelectUnstyled";
import { TabPanel } from "@mui/lab";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ColorSelector from "./ColorSelector";

import { PartType } from "../../hooks/useDancer";

const PropertyPanel = ({
  partType,
  parts,
}: {
  partType: PartType;
  parts: string[];
}) => {
  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          p: "5%",
          paddingTop: "0",
        },
      }}
    >
      <TabPanel value={partType} key={`property_tabpanel_${partType}`}>
        <List dense>
          {parts.map((part) =>
            partType === "LED" ? (
              <ListItemText primary={part} key={part} />
            ) : (
              <OFcontorls part={part} key={part} />
            )
          )}
        </List>
      </TabPanel>
    </Box>
  );
};

const OFcontorls = ({ part, key }: { part: string; key: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(0);

  // TODO connect to color swatch
  const colorOptions = [
    {
      label: "Red",
      value: "#D32F2F",
    },
    {
      label: "Green",
      value: "#4CAF50",
    },
    {
      label: "Blue",
      value: "#2196F3",
    },
  ];
  const [color, setColor] = useState<string>("#2196F3");

  const handleExpand = () => {
    setOpen(!open);
  };

  const handleColorChange = (color: string) => {
    setColor(color);
  };

  const sliderMarks: { value: number; label: string | null }[] = [];
  for (let i = 0; i <= 10; i++) {
    sliderMarks.push({
      value: i,
      label: i === 0 || i === 10 ? String(i) : null,
    });
  }
  sliderMarks.push({ value: 15, label: "15" });

  const handleSliderChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    setIntensity(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIntensity(Number(event.target.value));
  };

  const handleBlur = () => {
    if (intensity < 0) setIntensity(0);
    else if (intensity > 10 && intensity < 15) setIntensity(10);
    else if (intensity > 15) setIntensity(15);
  };

  return (
    <div key={key}>
      <ListItemButton onClick={handleExpand}>
        <ListItemText primary={part} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense>
          <ListItem>
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ justifyContent: "space-between" }}
            >
              <Grid item>
                <Typography>color</Typography>
              </Grid>
              <Grid item>
                <ColorSelector
                  placeholder="none"
                  options={colorOptions}
                  onChange={handleColorChange}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ justifyContent: "space-between" }}
            >
              <Grid item>
                <Typography>intensity</Typography>
              </Grid>
              <Grid item>
                <Slider
                  value={intensity}
                  onChange={handleSliderChange}
                  min={0}
                  max={15}
                  step={null}
                  valueLabelDisplay="auto"
                  marks={sliderMarks}
                  sx={{ width: "10em", position: "relative", top: "1em" }}
                />
              </Grid>
              <Grid item>
                <Input
                  value={intensity}
                  size="small"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
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
          </ListItem>
        </List>
      </Collapse>
    </div>
  );
};

export default PropertyPanel;
