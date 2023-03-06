import { Stack, Grid, Typography } from "@mui/material";
import ColorSelector from "../OFcontrols/ColorSelector";
import IntensityControl from "../IntensityControl";

export interface LEDBulbsControlsContentProps {
  handleColorChange: (color: string) => void;
  intensity: number | null;
  handleIntensityChange: (intensity: number) => void;
  currentColorName: string | null;
}

function LEDBulbsControlsContent({
  handleColorChange,
  handleIntensityChange,
  intensity,
  currentColorName,
}: LEDBulbsControlsContentProps) {
  return (
    <Stack gap="1.5vh">
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
          <Typography>color</Typography>
        </Grid>
        <Grid item>
          <ColorSelector
            placeholder="none"
            onChange={handleColorChange}
            currentColorName={currentColorName}
          />
        </Grid>
      </Grid>
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
          <Typography>intensity</Typography>
        </Grid>
        <IntensityControl
          intensity={intensity}
          setIntensity={handleIntensityChange}
        />
      </Grid>
    </Stack>
  );
}

export default LEDBulbsControlsContent;
