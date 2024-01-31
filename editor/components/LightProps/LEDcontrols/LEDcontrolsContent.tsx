import { Stack, Grid, Typography } from "@mui/material";
import SrcSelector from "./SrcSelector";
import IntensityControl from "../IntensityControl";
// hooks
import useLedMap from "hooks/useLedMap";

import _ from "lodash";
import { LEDPartName } from "@/core/models";

export interface LEDcontrolsContentProps {
  parts: LEDPartName[];
  intensity: number | null;
  src: string | null;
  handleIntensityChange: (intensity: number) => void;
  handleSrcChange: (src: string) => void;
  oneLine?: boolean;
}

function LEDcontrolsContent({
  parts,
  intensity,
  src,
  handleIntensityChange,
  handleSrcChange,
  oneLine,
}: LEDcontrolsContentProps) {
  const { loading, ledMap } = useLedMap();
  let effectNames =
    !loading && ledMap[parts[0]] ? Object.keys(ledMap[parts[0]]) : [];

  if (effectNames.length > 0) {
    parts.forEach((part) => {
      effectNames = _.intersection(effectNames, Object.keys(ledMap[part]));
    });
  }

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
              <SrcSelector
                src={src}
                effectNames={effectNames}
                handleSrcChange={handleSrcChange}
              />
            </Grid>
            <IntensityControl
              intensity={intensity}
              setIntensity={handleIntensityChange}
              // if src equals to null, then the effect is currently
              // switched to "empty"
              disabled={src === null}
            />
          </>
        ) : (
          <>
            <Grid item>
              <Typography>effect</Typography>
            </Grid>
            <Grid item>
              <SrcSelector
                src={src}
                effectNames={effectNames}
                handleSrcChange={handleSrcChange}
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
            // if src equals to null, then the effect is currently
            // switched to "empty"
            disabled={src === null}
          />
        </Grid>
      )}
    </Stack>
  );
}

export default LEDcontrolsContent;
