import { Stack, Grid, Typography } from "@mui/material";
import ColorSelector from "./ColorSelector";
import IntensityControl from "../IntensityControl";

export interface OFcontrolsContentProps {
  handleColorChange: (color: string) => void;
  intensity: number | null;
  handleIntensityChange: (intensity: number) => void;
  currentColorName: string | null;
  oneLine?: boolean;
}

function OFcontrolsContent({
  handleColorChange,
  handleIntensityChange,
  intensity,
  currentColorName,
  oneLine = false,
}: OFcontrolsContentProps) {
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
        {oneLine ? (
          <>
            <Grid item>
              <ColorSelector
                placeholder="none"
                onChange={handleColorChange}
                currentColorName={currentColorName}
              />
            </Grid>
            <IntensityControl
              intensity={intensity}
              setIntensity={handleIntensityChange}
            />
          </>
        ) : (
          <>
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
          </>
        )}
      </Grid>
      {oneLine ? (
        <></>
      ) : (
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
      )}
    </Stack>
  );
}

export default OFcontrolsContent;
