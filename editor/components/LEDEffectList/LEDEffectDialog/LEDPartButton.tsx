import { Typography, Grid, Button } from "@mui/material";

interface LEDPartButtonProps {
  chosenLEDPart: string;
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
      <Typography sx={{ mb: 1 }}>PARTS</Typography>
      {/* <ToggleButtonGroup
        color="primary"
        size="medium"
        exclusive
        onChange={handleChangeChosenLEDPart}
        value={chosenLEDPart}
      >
        {displayLEDParts.map((v) => (
          <ToggleButton value={v} key={v}>
            {v}
          </ToggleButton>
        ))}
      </ToggleButtonGroup> */}
      <Grid container spacing={2} justifyContent="flex-start" sx={{ mb: 2 }}>
        {displayLEDParts.map((v) => (
          <Grid item key={v}>
            <Button
              variant={chosenLEDPart === v ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleChangeChosenLEDPart(v)}
            >
              {v}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
