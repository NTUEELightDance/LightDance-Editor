import { Stack, Grid, Typography } from "@mui/material";
import ColorSelector from "../OFcontrols/ColorSelector";
import IntensityControl from "../IntensityControl";
import { ColorID } from "@/core/models";

export interface LEDBulbsControlsContentProps {
  handleColorChange: (colorID: ColorID) => void;
  intensity: number | null;
  handleIntensityChange: (intensity: number) => void;
  currentColorID: number | null;
}

function LEDBulbsControlsContent({
  handleColorChange,
  handleIntensityChange,
  intensity,
  currentColorID,
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
            currentColorID={currentColorID}
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
          disabled={false}
        />
      </Grid>
    </Stack>
  );
}

export default LEDBulbsControlsContent;
