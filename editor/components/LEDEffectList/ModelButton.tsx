import { Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";

interface ModelButtonProps {
  chosenModel: string;
  handleChangeChosenModel: (
    event: React.MouseEvent<HTMLElement>,
    newChosenModel: string
  ) => void;
  displayModels: string[];
}

export default function ModelButton({
  chosenModel,
  handleChangeChosenModel,
  displayModels,
}: ModelButtonProps) {
  return (
    <>
      <Typography>MODELS</Typography>
      <ToggleButtonGroup
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
          <ToggleButton value={v} key={v} sx={{ '& .MuiToggleButton-root': { borderLeft: '1px solid rgba(1, 1, 1, 0.23)' } }} style={{ marginRight: '8px' }}>
            {v}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
}
