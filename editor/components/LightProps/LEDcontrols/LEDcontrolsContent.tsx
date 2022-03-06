import { Stack, Grid, Typography } from "@mui/material";
import SrcSelector from "./SrcSelector";
import IntensityControl from "../IntensityControl";
// hooks
import useLedMap from "hooks/useLedMap";

const LEDcontrolsContent = ({
  part,
  intensity,
  src,
  handleIntensityChange,
  handleSrcChange,
}: {
  part: string;
  intensity: number;
  src: string;
  handleIntensityChange: (intensity: number) => void;
  handleSrcChange: (src: string) => void;
}) => {
  const { loading, ledMap } = useLedMap();
  const effectNames = !loading && ledMap[part] ? Object.keys(ledMap[part]) : [];
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
          <SrcSelector
            src={src}
            effectNames={effectNames}
            handleSrcChange={handleSrcChange}
          />
        </Grid>
        <IntensityControl
          intensity={intensity}
          setIntensity={handleIntensityChange}
        />
      </Grid>
    </Stack>
  );
};

export default LEDcontrolsContent;
