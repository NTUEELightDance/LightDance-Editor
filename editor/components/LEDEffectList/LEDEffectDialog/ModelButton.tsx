import { Typography, Button } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid/Grid";

interface ModelButtonProps {
  chosenModel: string | null;
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
      <Typography sx={{ mb: 1 }}>Models</Typography>
      <Grid container spacing={2} justifyContent="flex-start" sx={{ mb: 2 }}>
        {displayModels.map((modelName) => (
          <Grid key={modelName}>
            <Button
              variant={chosenModel === modelName ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleChangeChosenModel(modelName)}
            >
              {modelName}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
