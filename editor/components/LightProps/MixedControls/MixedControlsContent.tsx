import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import IntensityControl from "../IntensityControl";

export interface MixedControlsContentProps {
  intensity: number | null;
  handleIntensityChange: (intensity: number) => void;
}

function MixedControlsContent({
  intensity,
  handleIntensityChange,
}: MixedControlsContentProps) {
  return (
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
  );
}

export default MixedControlsContent;
