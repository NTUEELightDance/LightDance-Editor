import { useEffect, useState } from "react";

import { Box, Typography, ListItemButton, Collapse, Grid } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import IntensityControl from "../IntensityControl";

import { LED } from "../../../core/models";
import { editCurrentStatusLED } from "../../../core/actions";

const LEDcontrols = ({
  part,
  currentDancers,
  displayValue,
}: {
  part: string;
  currentDancers: string[];
  displayValue: LED;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<number>(displayValue.alpha);

  // mutate global state
  useEffect(() => {
    currentDancers.forEach((dancerName) => {
      editCurrentStatusLED({
        payload: { dancerName, partName: part, value: intensity },
      });
    });
  }, [intensity]);

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
          <Box sx={{ width: "3vw" }}>
            <Typography>{valueLabelFormat(displayValue.alpha)}</Typography>
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
            px: "5em",
          }}
        >
          <IntensityControl intensity={intensity} setIntensity={setIntensity} />
        </Grid>
      </Collapse>
    </>
  );
};
export default LEDcontrols;
