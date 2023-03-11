import { Typography, Button } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid/Grid";

interface ModelButtonProps {
  chosenModel: string;
  handleChangeChosenModel: (newChosenModel: string) => void;
  displayModels: string[];
}

export default function ModelButton({
  chosenModel,
  handleChangeChosenModel,
  displayModels,
}: ModelButtonProps) {
  return (
    <>
      <Typography sx={{ mb: 1 }}>MODELS</Typography>
      {/* <ToggleButtonGroup
        color="primary"
        size="medium"
        exclusive
        onChange={handleChangeChosenModel}
        value={chosenModel}
        // sx={{
        //   display: "grid",
        //   gridTemplateColumns: "auto auto auto auto",
        //   gridGap: "50px",
        //   padding: "10px",
        // }}
        //sx={{ '& .MuiToggleButton-root + .MuiToggleButton-root': { marginLeft: '8px' } }}
      >
        {displayModels.map((v) => (
          <ToggleButton
            value={v}
            key={v}
            sx={{
              "& .MuiToggleButton-root": {
                borderLeft: "1px solid rgba(1, 1, 1, 0.23)",
              },
            }}
            style={{ marginRight: "8px" }}
          >
            {v}
          </ToggleButton>
        ))}
      </ToggleButtonGroup> */}
      <Grid container spacing={2} justifyContent="flex-start" sx={{ mb: 2 }}>
        {displayModels.map((v) => (
          <Grid key={v}>
            <Button
              variant={chosenModel === v ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleChangeChosenModel(v)}
            >
              {v}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
