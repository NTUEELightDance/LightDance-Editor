import { Box, Grid, Typography, Slider, Input } from "@mui/material";
import ColorSelector from "../ColorSelector";
import IntensityControl from "../IntensityControl";

const OFcontrolsContent = ({
  handleColorChange,
  intensity,
  setIntensity,
  oneLine = false,
}: {
  handleColorChange: (color: string) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  oneLine?: boolean;
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{
          justifyContent: "space-between",
          px: "3em",
        }}
      >
        {oneLine || (
          <Grid item>
            <Typography>color</Typography>
          </Grid>
        )}
        <Grid item>
          <ColorSelector placeholder="none" onChange={handleColorChange} />
        </Grid>
        {oneLine && (
          <IntensityControl intensity={intensity} setIntensity={setIntensity} />
        )}
      </Grid>
      {oneLine || (
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
          {
            <IntensityControl
              intensity={intensity}
              setIntensity={setIntensity}
            />
          }
        </Grid>
      )}
    </Box>
  );
};

export default OFcontrolsContent;
