import { Typography, Button } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid/Grid";

interface SingleSelectButtonArrayProps {
  label?: string;
  selectedOption: string | null;
  handleChangeSelectedOption: (option: string) => void;
  displayModels: string[];
}

export default function SingleSelectButtonArray({
  label,
  selectedOption,
  handleChangeSelectedOption,
  displayModels,
}: SingleSelectButtonArrayProps) {
  return (
    <>
      {label && <Typography sx={{ mb: 1 }}>{label}</Typography>}
      <Grid container spacing={2} justifyContent="flex-start">
        {displayModels.map((modelName) => (
          <Grid key={modelName}>
            <Button
              variant={selectedOption === modelName ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleChangeSelectedOption(modelName)}
            >
              {modelName}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
