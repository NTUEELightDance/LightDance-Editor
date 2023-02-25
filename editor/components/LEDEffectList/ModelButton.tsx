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
        //   gridGap: "10px",
        //   padding: "0px",
        // }}
      >
        {displayModels.map((v) => (
          <ToggleButton value={v} key={v}>
            {v}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
}
