import { LEDPartName } from "@/core/models";
import { Typography, Grid, Button } from "@mui/material";

interface LEDPartButtonProps {
  chosenLEDPart: LEDPartName | null;
  handleChangeChosenLEDPart: (newChosenLEDPart: string) => void;
  displayLEDParts: string[];
}

export default function LEDPartButton({
  chosenLEDPart,
  handleChangeChosenLEDPart,
  displayLEDParts,
}: LEDPartButtonProps) {
  return (
    <>
      <Typography sx={{ mb: 1 }}>Parts</Typography>
      {displayLEDParts.length === 0 ? (
        <Typography sx={{ mb: 1 }} color="gray">
          Please Select a Model First
        </Typography>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            justifyContent="flex-start"
            sx={{ mb: 2 }}
          >
            {displayLEDParts.map((partName) => (
              <Grid item key={partName}>
                <Button
                  variant={
                    chosenLEDPart === partName ? "contained" : "outlined"
                  }
                  color="primary"
                  onClick={() => handleChangeChosenLEDPart(partName)}
                >
                  {partName}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </>
  );
}
